import { v4 as uuidv4 } from 'uuid';
import { getDb } from '~/libs/db';
import { AttributionPayload } from '~/libs/attribution';
import { ClientEnv, ServerAttribution } from '~/libs/attribution-server';

export interface UserAttributionOptions {
  attribution?: AttributionPayload;
  clientEnv?: ClientEnv;
}

export const checkAndSaveUser = async (
  name: string,
  email: string,
  image: string,
  last_login_ip: string,
  options?: UserAttributionOptions
) => {
  try {
    const db = getDb();
    const results = await db.query(`select * from user_info where email=$1;`, [email]);
    const users = results.rows;

    const attr = options?.attribution;
    const env = options?.clientEnv;

    if (users.length <= 0) {
      // 1. 新增用户
      const strUUID = uuidv4();
      const ip = env?.ip || last_login_ip || '';

      // 防刷判断：同一 IP 在过去 24 小时内注册新账号如果过多，停止赠送免费体验点数
      let grantBonus = true;
      try {
        if (ip && ip !== '127.0.0.1') {
          const recentRes = await db.query(
            `select count(*) as count from user_info where last_login_ip = $1 and created_at >= now() - interval '24 hours'`,
            [ip]
          );
          const count = parseInt(recentRes.rows[0]?.count || '0', 10);
          if (count >= 5) {
            grantBonus = false;
            console.warn(`[Anti-Abuse] IP ${ip} registered ${count} accounts in 24h. Registration bonus disabled.`);
          }
        }
      } catch (abuseErr: any) {
        // Fallback gracefully on query error
      }

      const freeTimes = grantBonus ? (Number(process.env.FREE_TIMES) || 2) : 0;

      // 尝试插入带全量归因字段的记录
      try {
        await db.query(
          `INSERT INTO user_info(
            user_id, name, email, image, last_login_ip,
            first_source, first_medium, first_campaign, first_referrer, first_landing, first_touch_at,
            last_source, last_medium, last_campaign,
            register_country, register_device, register_os, register_browser, register_lang
          ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
          [
            strUUID,
            name,
            email,
            image,
            ip,
            attr?.first_source || 'direct',
            attr?.first_medium || 'none',
            attr?.first_campaign || '',
            attr?.first_referrer || '',
            attr?.first_landing || '',
            attr?.first_touch_at || Math.floor(Date.now() / 1000),
            attr?.last_source || 'direct',
            attr?.last_medium || 'none',
            attr?.last_campaign || '',
            env?.country || '',
            env?.device || '',
            env?.os || '',
            env?.browser || '',
            env?.lang || attr?.register_lang || ''
          ]
        );
      } catch (insertErr: any) {
        // 兼容降级：若数据库尚未执行添加列操作，回退到基础列插入
        console.warn("Attribution columns insert fallback to legacy insert:", insertErr?.message);
        await db.query(
          'INSERT INTO user_info(user_id,name,email,image,last_login_ip) VALUES($1,$2,$3,$4,$5)',
          [strUUID, name, email, image, ip]
        );
      }

      // 免费生成次数
      await db.query(
        'INSERT INTO user_available(user_id,stripe_customer_id,available_times) VALUES($1, $2, $3)',
        [strUUID, '', freeTimes]
      );

      return {
        user_id: strUUID,
        name: name,
        email: email,
        image: image,
        first_source: attr?.first_source || 'direct',
        register_country: env?.country || '',
      };
    } else {
      // 2. 老用户更新登录状态
      const user = users[0];
      const ip = env?.ip || last_login_ip || user.last_login_ip;

      await db.query(
        'UPDATE user_info SET name=$1, image=$2, last_login_ip=$3, updated_at=now() WHERE id=$4',
        [name || user.name, image || user.image, ip, user.id]
      );

      return user;
    }
  } catch (err: any) {
    console.warn("DB checkAndSaveUser warning, fallback gracefully:", err?.message);
    return {
      user_id: 'usr-' + (email ? Buffer.from(email).toString('hex').slice(0, 12) : uuidv4().slice(0, 8)),
      name: name || '',
      email: email || '',
      image: image || '',
    };
  }
};

export const getUserById = async (user_id: string) => {
  try {
    const db = getDb();
    const results = await db.query('select * from user_info where user_id=$1', [user_id]);
    const users = results.rows;
    if (users.length > 0) {
      const user = users[0];
      return {
        user_id: user_id,
        name: user.name,
        email: user.email,
        image: user.image,
        first_source: user.first_source || 'direct',
        register_country: user.register_country || '',
        status: 1
      };
    }
  } catch (err: any) {
    console.warn("DB getUserById warning:", err?.message);
  }
  return {
    user_id: user_id,
    name: '',
    email: '',
    image: '',
    first_source: 'direct',
    register_country: '',
    status: 0
  };
};

export const getUserByEmail = async (email: string) => {
  try {
    const db = getDb();
    const results = await db.query('select * from user_info where email=$1', [email]);
    const users = results.rows;
    if (users.length > 0) {
      const user = users[0];
      return {
        user_id: user.user_id,
        name: user.name,
        email: email,
        image: user.image,
        first_source: user.first_source || 'direct',
        register_country: user.register_country || '',
        status: 1
      };
    } else {
      // User authenticated via OAuth but row not yet created: auto-insert
      const fallbackName = email ? email.split('@')[0] : 'User';
      const created = await checkAndSaveUser(fallbackName, email, '', '');
      return {
        user_id: created?.user_id || ('usr-' + (email ? Buffer.from(email).toString('hex').slice(0, 12) : 'guest')),
        name: created?.name || fallbackName,
        email: email,
        image: created?.image || '',
        first_source: (created as any)?.first_source || 'direct',
        register_country: (created as any)?.register_country || '',
        status: 1
      };
    }
  } catch (err: any) {
    console.warn("DB getUserByEmail warning:", err?.message);
    return {
      user_id: 'usr-' + (email ? Buffer.from(email).toString('hex').slice(0, 12) : 'default'),
      name: email ? email.split('@')[0] : '',
      email: email,
      image: '',
      first_source: 'direct',
      register_country: '',
      status: 1
    };
  }
};
