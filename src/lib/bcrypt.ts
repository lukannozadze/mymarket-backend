import bcrypt from  'bcrypt'

const saltRounds = 10;

export const hashPassword = async (password:string) =>{
const salt = await bcrypt.genSalt(saltRounds);
return await bcrypt.hash(password,salt)
}
export const comparePassword = (plain:string,hashed:string) =>{
    return bcrypt.compareSync(plain,hashed);
}