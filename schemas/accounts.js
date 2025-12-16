import { validate } from "uuid";

export default {
  name: 'accounts',
  title: 'Accounts',
  type: 'document',
  fields: [
    {
      name: 'accountUUID',
      title: 'Account UUID',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'accountType',
      title: 'Account Type',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'accountName',
      title: 'Account Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().custom(isValidEmail)
    },
    {
      name: 'passwordHashed',
      title: 'Password Hashed',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'lastLogin',
      title: 'Last Login',
      type: 'datetime'
    },
    {
      name: 'twoFactorScrets',
      title: 'Two Factor Secrets',
      type: 'document',
      fields: [
        {
          name: 'cipherText',
          title: 'Cipher Text',
          type: 'string',
          validation: Rule => Rule.required()
        },
        {
          name: 'nonce',
          title: 'Nonce',
          type: 'string',
          validation: Rule => Rule.required()
        }
      ],
      validation: Rule => Rule.required()
    },
    {
      name: 'twoFactorEnabled',
      title: 'Two Factor Enabled',
      type: 'boolean',
      validation: Rule => Rule.required()
    }
  ]
}