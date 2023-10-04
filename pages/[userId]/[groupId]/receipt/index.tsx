import { receiptSummary } from '../../../../lib/main';
import type { Item, Receipt, User } from '@prisma/client';
import Layout from '../../../../components/layout';
import { DateText } from '../../../../components/helper';

export default (
  props: {
    receipt: Receipt & { items: (Item & { payee: User[] })[] } & { payer: User } & { group: { users: User[] }},
    query: { userId: string, groupId: string, id: string },
  }
) => {
  return (
    <Layout>
      <h1>{ props.receipt.name }</h1>
      <p>Paid by { props.receipt.payer.name } at <DateText date={ props.receipt.createdAt } /></p>
      <form
        id="create-item"
        method="post"
        action="/api/create/item" />
      <table className="ma" style={{fontFamily: 'monospace'}} cellSpacing="0" cellPadding="0" >
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
              <td>
                <form
                  method="post"
                  action="/api/delete/item"
                >
                  <input type="hidden" name="selfId" value={props.query.userId}/>
                  <input type="hidden" name="groupId" value={props.query.groupId}/>
                  <input type="hidden" name="receiptId" value={props.query.id}/>
                  <input type="hidden" name="itemId" value={item.id}/>
                  <input type="submit" value="🗑️" style={{ position: 'absolute', transform: 'translate(-150%, -0.3rem)'}}/>
                  { item.name }
                </form>
              </td>
              <td align="right" style={{paddingRight: '1ch'}}>{ item.price }</td>
              { props.receipt.group.users.map((user) => (
                <td key={ user.id }>
                  { (item.payee.some((payee) => payee.id === user.id)) ? 'X' : ''}
                </td>
              )) }
            </tr>
          )) }
          <tr>
            <input type="hidden" form="create-item" name="selfId" value={props.query.userId}/>
            <input type="hidden" form="create-item" name="groupId" value={props.query.groupId}/>
            <input type="hidden" form="create-item" name="receiptId" value={props.query.id}/>
            <td><input type="text" form="create-item" name="name" required/></td>
            <td><input type="number" min="0" step="0.01" form="create-item" name="price" required/></td>
            { props.receipt.group.users.map((user, index) => (
              <td key={ user.id } style={{padding: '0'}}>
                <input type="checkbox" form="create-item" name="payeeIds" value={ user.id } />
                { (index === props.receipt.group.users.length - 1) ?
                <input type="submit" form="create-item" value="✅" style={{ position: 'absolute', transform: 'translate(0.5rem, 0)'}}/> : ''}
              </td>
            )) }
          </tr>
        </tbody>
      </table>
    </Layout>
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
