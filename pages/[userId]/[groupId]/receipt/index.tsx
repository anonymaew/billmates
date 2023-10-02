import { receiptSummary } from '../../../../lib/main';

export default ({ receipt, query }) => {
  return (
    <>
      <nav>
        <a href="./">Back</a>
      </nav>
      <h1>{ receipt.name }</h1>
      <p>Payed by { receipt.payer.name }</p>
      <table style={{fontFamily: 'monospace'}} cellSpacing="0" cellPadding="0" >
        <thead>
          <tr>
            <th>Item</th>
            <th>Price</th>
            { receipt.group.users 
              .map(({ name }) =>
              <th key={ name } style={{writingMode: 'vertical-lr', textAlign: 'right' }}>{ name }</th>
            )}
          </tr>
        </thead>
        <tbody>
          { receipt.items.map((item) => (
            <tr
              key={ item.id }
              className={ item.payee.some((payee) => payee.id === query.userId) ? 'highlight' : '' }
            >
              <td>{ item.name }</td>
              <td align="right" style={{paddingRight: '1ch'}}>{ item.price }</td>
              { receipt.group.users.map((user) => (
                <td key={ user.id }>
                  { (item.payee.some((payee) => payee.id === user.id)) ? 'X' : ''}
                </td>
              )) }
            </tr>
          )) }
          { /*
          <tr>
            <td><input type="text" /></td>
            <td><input type="number" /></td>
            { receipt.group.users.map((user) => (
              <td key={ user.id } style={{padding: '0'}}>
                <input type="checkbox" />
              </td>
            )) }
          </tr>
          */ }
          <tr>
            <td>Total</td>
            <td>{ receipt.items.reduce((acc, item) => acc + item.price, 0).toFixed(2) }</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export const getServerSideProps = async ({ query }) => {
  console.log(query)
  const receipt = await receiptSummary(query.userId, query.id)
  return {
    props: { receipt, query },
  };
};
