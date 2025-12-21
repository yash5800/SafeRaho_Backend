import {defineField, defineType} from 'sanity'


export default defineType({
  name: 'accounts',
  title: 'Accounts',
  type: 'document',
  fields: [
    defineField({
      name: 'accountUUID',
      title: 'Account UUID',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'accountType',
      title: 'Account Type',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'accountName',
      title: 'Account Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'passwordHashed',
      title: 'Password Hashed',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'lastLogin',
      title: 'Last Login',
      type: 'datetime'
    }),
    defineField({
      name: 'twoFactorSecrets',
      title: '2FA Secret (hashed)',
      type: 'document',
      fields: [
        defineField({
          name: 'cipherText',
          title: 'Cipher Text',
          type: 'string',
          validation: Rule => Rule.required()
        }),
        defineField({
          name: 'nonce',
          title: 'Nonce',
          type: 'string',
          validation: Rule => Rule.required()
        }),
      ],
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'twoFactorEnabled',
      title: 'Two Factor Enabled',
      type: 'boolean',
      validation: Rule => Rule.required()
    })
  ]
});