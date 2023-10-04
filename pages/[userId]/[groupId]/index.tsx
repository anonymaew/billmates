import { groupSummary } from '../../../lib/main';
import type { ReceiptDetail } from '../../../lib/main';
import type { Group, Item, Receipt, User } from '@prisma/client';
import Layout from '../../../components/layout';
import { DateText } from '../../../components/helper';

export default (
  props: {
    group: Group & { users: (User & { balance?: number })[] } & { receipts: ReceiptDetail[] },
    query: { userId: string, groupId: string },
  }
) => {
  return (
    <Layout>
      <h1>{ props.group.name }</h1>
      <h2>Users</h2>
      <ul>
      { props.group.users.map(user =>
        <li key={user.id} className="f jcsb">
          <span>
            <b>{user.name}</b>
            {user.balance !== undefined ?
              (user.balance > 0 ?
                  <span style={{color: 'red'}}> lent you {user.balance}</span> :
              user.balance < 0 ?
                <span style={{color: 'green'}}> owed you {-user.balance}</span> :
                <span className="insignificant"> settled up</span>
              ) :
            ''
            }
          </span>
          { user.balance && user.balance > 0 ?
            <a href={`/${props.query.userId}/${props.query.groupId}/payment?to=${user.id}&amount=${user.balance}`}>
              Pay now
            </a> :
            <></>
          }
        </li>
      )}
      </ul>
      <h2>Receipts</h2>
      <ul>
        <li>
        <form
          method="post"
          action="/api/create/receipt"
        >
          <input type="hidden" name="selfId" value={props.query.userId}/>
          <input type="hidden" name="groupId" value={props.query.groupId}/>
          <input type="text" name="name" placeholder="seller name" required/>
          {' paid by '}
          <select name="payerId" defaultValue={props.query.userId}>
            { props.group.users.map(user =>
              <option key={user.id} value={user.id}>{user.name}</option>
            ) }
          </select>
          {' at '}
          <input type="date" name="createdAt"/>
          <input type="submit" value="✅" />
          </form>
        </li>
        { props.group.receipts.map(receipt =>
          <li key={receipt.id} className="f jcsb">
            <span>
              <input type="submit" value="🗑️" style={{ position: 'absolute', transform: 'translate(-200%, 0.5rem)'}}/>
              <a href={`/${props.query.userId}/${props.query.groupId}/receipt?id=${receipt.id}`}>{receipt.name}</a>
              <br/>
              <span className="insignificant">
                {` paid by ${receipt.payer.name} at `}
                <DateText date={receipt.createdAt}/>
              </span>
            </span>
            <span>
              {receipt.payer.id !== props.query.userId && receipt.owed > 0 ? receipt.owed : ''}
            </span>
          </li>
        ) }
      </ul>
    </Layout>
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
