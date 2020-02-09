module.exports = {
  name: 'certificate',
  fields: [
    {
      name: 'name',
      type: 'String',
      length: 35
    },
    {
      name: 'id',
      type: 'String',
      length: 30,
      not_null: true
    },
    {
      name: 'university',
      type: 'String',
      length: 50,
      not_null: true,
      index: true
    },
    {
      name: 'coursename',
      type: 'String',
      length: 100,
      not_null: true,
      index: true
    },
    {
      name: 'dateofissue',
      type: 'String',
      length: 100,
      not_null: true,
      index: true
    },
    {
      name: 'enrollmentId',
      type: 'String',
      length: 100,
      not_null: true,
      index: true
    },
    {
      name: 'address',
      type: 'String',
      length: 256,
      not_null: true,
      index: true
    }
  ]
}
//address,name,id,university,coursename,dateofissue,enrollmentId