import { groupSummary } from '../../../lib/main';
import type { Group, Item, Receipt, User } from '@prisma/client';

export default (
  props: {
    group: Group & { users: (User & { balance?: number })[] } & { receipts: (Receipt & { items?: (Item & { payee: User[] })[] } & { owed: number })[] },
    query: { userId: string, groupId: string },
  }
) => {
  return (
    <>
      <h1>{ props.group.name }</h1>
      <h2>Users</h2>
      <ul>
      { props.group.users.map(user =>
        <li key={user.id}>
          {user.name}
          {user.balance ?
            (user.balance > 0 ?
              <>
                - You <span style={{color: 'red'}}>owed {user.balance}</span>.&nbsp;
                <a href={`/${props.query.userId}/${props.query.groupId}/payment?to=${user.id}&amount=${user.balance}`}>
                  Pay now
                </a>
              </> :
              <>
                - You <span style={{color: 'green'}}>lent {-user.balance}</span>
              </>) :
            ''
          }
        </li>
      )}
      </ul>
      <h2>Receipts</h2>
      <ul>
      { props.group.receipts.map(receipt =>
        <li key={receipt.id}>
          <a href={`/${props.query.userId}/${props.query.groupId}/receipt?id=${receipt.id}`}>{receipt.name} - {receipt.owed}</a>
        </li>
      ) }
      </ul>
    </>
  );
};

export const getServerSideProps = async (
  context: {
    query: { userId: string, groupId: string },
  }
) => {
  const group = await groupSummary(context.query.userId, context.query.groupId)
  return {
    props: {
      group,
      query: context.query,
    },
  };
};
