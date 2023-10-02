import { PrismaClient } from '@prisma/client'

export default ({ user, query }) => {
  return (
    <>
      <h1>{user.name}</h1>
      <h2>Groups</h2>
      <ul>
        {user.groups.map((group) => (
          <li key={group.id}>
            <a href={`/${query.userId}/${group.id}`}>{group.name}</a>
          </li>
        ))}
      </ul>
    </>
  )
}

export const getServerSideProps = async ({ query }) => {
  const prisma = new PrismaClient()
  const user = await prisma.user.findUnique({
    where: { id: query.userId },
    include: { groups: true },
  })
  return {
    props: {
      user,
      query,
    },
  }
}
