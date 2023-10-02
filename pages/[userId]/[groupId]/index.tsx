import { groupSummary } from '../../../lib/main';

export default ({ group, query }) => {
  return (
    <>
      <h1>{ group.name }</h1>
      <h2>Users</h2>
      <ul>
      { group.users.map(user =>
        <li key={user.id}>
          {user.name}
          {user.balance ?
            (user.balance > 0 ?
              <>
                - You <span style={{color: 'red'}}>owed {user.balance}</span>.&nbsp;
                <a href={`/${query.userId}/${query.groupId}/payment?to=${user.id}&amount=${user.balance}`}>
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
      { group.receipts.map(receipt =>
        <li key={receipt.id}>
          <a href={`/${query.userId}/${query.groupId}/receipt?id=${receipt.id}`}>{receipt.name} - {receipt.owed}</a>
        </li>
      ) }
      </ul>
    </>
  );
};

export const getServerSideProps = async ({ query }) => {
  const group = await groupSummary(query.userId, query.groupId)
  return {
    props: {
      group,
      query,
    },
  };
};
