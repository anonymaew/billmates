import { ReactNode } from 'react';

const Layout = ( props: { children: ReactNode }) => {
  return (
    <div>
      <nav>
        <div className="layout f jcsb">
          <span style={{fontWeight: 'bold', fontSize: '1.5rem' 
          }}>Billmates</span>
          <a href="./">back</a>
        </div>
      </nav>
      <div className="layout">
          { props.children }
      </div>
    </div>
  )
}

export default Layout;
