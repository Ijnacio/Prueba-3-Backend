export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'no_utilizar_en_produccion',
  expiresIn: process.env.JWT_EXPIRES || '1d',
};