import {v4 as uuidv4} from 'uuid';
import {getDb} from "~/libs/db";

export const checkAndSaveUser = async (name: string, email: string, image: string, last_login_ip: string) => {
  try {
    const db = getDb();
    const results = await db.query(`select * from user_info where email=$1;`, [email]);
    const users = results.rows;
    if (users.length <= 0) {
      const result = {
        user_id: '',
        name: '',
        email: '',
        image: '',
      }
      // 新增
      const strUUID = uuidv4();
      await db.query('insert into user_info(user_id,name,email,image,last_login_ip) values($1,$2,$3,$4,$5)',
        [strUUID, name, email, image, last_login_ip]);

      // 免费生成次数
      const freeTimes = Number(process.env.FREE_TIMES) || 2;
      await db.query('insert into user_available(user_id,stripe_customer_id,available_times) values($1, $2, $3)', [strUUID, '', freeTimes]);

      result.user_id = strUUID;
      result.name = name;
      result.email = email;
      result.image = image;
      return result;
    } else {
      // 更新
      const user = users[0];
      await db.query('update user_info set name=$1,image=$2,last_login_ip=$3,updated_at=now() where id=$4',
        [name, image, last_login_ip, user.id]);
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
}

export const getUserById = async (user_id) => {
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
        status: 1
      }
    }
  } catch (err: any) {
    console.warn("DB getUserById warning:", err?.message);
  }
  return {
    user_id: user_id,
    name: '',
    email: '',
    image: '',
    status: 0
  }
}

export const getUserByEmail = async (email) => {
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
        status: 1
      }
    }
  } catch (err: any) {
    console.warn("DB getUserByEmail warning:", err?.message);
    return {
      user_id: 'usr-' + (email ? Buffer.from(email).toString('hex').slice(0, 12) : 'default'),
      name: '',
      email: email,
      image: '',
      status: 1
    }
  }
  return {
    user_id: '',
    name: '',
    email: email,
    image: '',
    status: 0
  }
}
