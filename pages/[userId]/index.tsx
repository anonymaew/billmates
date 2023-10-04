import { PrismaClient } from '@prisma/client'
import type { Group, User } from '@prisma/client'
import Layout from '../../components/layout'

export default (
  props: {
    user: User & { groups: Group[] },
    query: { userId: string } 
  }
) => {
  if (!props.user)
    return <></>;

  return (
    <Layout>
      <h1>{props.user.name}</h1>
      <h2>Groups</h2>
      <ul>
        {props.user.groups.map((group) => (
          <li key={group.id}>
            <a href={`/${props.query.userId}/${group.id}`}>{group.name}</a>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export const getServerSideProps = async (
  context: {
    query: { userId: string }
  }
) => {
  const prisma = new PrismaClient()
  const user = await prisma.user.findUnique({
    where: { id: context.query.userId },
    include: { groups: true },
  })
  return {
    props: {
      user,
      query: context.query,
    },
  }
}
