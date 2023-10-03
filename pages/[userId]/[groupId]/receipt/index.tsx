import { receiptSummary } from '../../../../lib/main';
import type { Item, Receipt, User } from '@prisma/client';

export default (
  props: {
    receipt: Receipt & { items: (Item & { payee: User[] })[] } & { payer: User } & { group: { users: User[] }},
    query: { userId: string, groupId: string, id: string },
  }
) => {
  return (
    <>
      <nav>
        <a href="./">Back</a>
      </nav>
      <h1>{ props.receipt.name }</h1>
      <p>Payed by { props.receipt.payer.name }</p>
      <form
        method="post"
        action="/api/create/item"
      >
        <table style={{fontFamily: 'monospace'}} cellSpacing="0" cellPadding="0" >
          <thead>
            <tr>
              <th>Item</th>
              <th>Price</th>
              { props.receipt.group.users 
                .map(({ name }) =>
                <th key={ name } style={{writingMode: 'vertical-lr', textAlign: 'right' }}>{ name }</th>
              )}
            </tr>
          </thead>
          <tbody>
            { props.receipt.items.map((item) => (
              <tr
                key={ item.id }
                className={ item.payee.some((payee) => payee.id === props.query.userId) ? 'highlight' : '' }
              >
                <td>{ item.name }</td>
                <td align="right" style={{paddingRight: '1ch'}}>{ item.price }</td>
                { props.receipt.group.users.map((user) => (
                  <td key={ user.id }>
                    { (item.payee.some((payee) => payee.id === user.id)) ? 'X' : ''}
                  </td>
                )) }
              </tr>
            )) }
            <tr>
                <input type="hidden" name="selfId" value={props.query.userId}/>
                <input type="hidden" name="groupId" value={props.query.groupId}/>
                <input type="hidden" name="receiptId" value={props.query.id}/>
                <td><input type="text" name="name" required/></td>
                <td><input type="number" min="0" name="price" required/></td>
              { props.receipt.group.users.map((user) => (
                <td key={ user.id } style={{padding: '0'}}>
                  <input type="checkbox" name="payeeIds" value={ user.id } />
                </td>
              )) }
            </tr>
            { /*
            <tr>
              <td>Total</td>
              <td>{ props.receipt.items.reduce((acc, item) => acc + item.price, 0).toFixed(2) }</td>
            </tr>
            */ }
          </tbody>
        </table>
        <input type="submit" value="Add" />
      </form>
    </>
  );
};

export const getServerSideProps = async (
  context: {
    query: { userId: string, groupId:string, id: string },
  }
) => {
  const receipt = await receiptSummary(context.query.userId, context.query.id)
  return {
    props: {
      receipt,
      query: context.query,
    },
  };
};
