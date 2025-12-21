import { z } from "zod";

export const AccountSchema = z.object({
  _type:z
   .literal('accounts')
   .default('accounts'),

   accountUUID: z
   .string()
   .uuid('Invalid account UUiD'),

   accountType: z
   .enum(['admin','general','google'])
   .default('user'),

   accountName: z
   .string()
   .min(3,'Account name too short')
   .max(100),

   email:z 
   .string()
   .email('Invalid email address'),

   passwordHashed: z
   .string()
   .min(32,'Invalid password hash'),

   lastLogin: z
   .string()
   .datetime()
   .optional(),

   twoFactorSecrets: z
   .object({
    cipherText: z.string().min(16),
    nonce: z.string().min(12),
   }),

   twoFactorEnable: z
   .boolean()
   .default(false),
   
})
.strict();