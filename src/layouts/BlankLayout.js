import React, { Fragment } from 'react';
import { Link, Redirect, Switch, Route } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Icon } from 'antd';
import GlobalFooter from '../components/GlobalFooter';
import styles from './UserLayout.less';
import { getRoutes, getPageQuery, getQueryPath } from '../utils/utils';

const links = [
  {
    key: 'help',
    title: 'Help',
    href: '',
  },
  {
    key: 'privacy',
    title: 'Privacy',
    href: '',
  },
  {
    key: 'terms',
    title: 'Terms',
    href: '',
  },
];

const copyright = (
  <Fragment>
    Copyright <Icon type="copyright" /> 2019 SaaSquash Technologies
  </Fragment>
);

function getLoginPathWithRedirectPath() {
  const params = getPageQuery();
  const { redirect } = params;
  return getQueryPath('/user/login', {
    redirect,
  });
}

class BlankLayout extends React.PureComponent {
  getPageTitle() {
    const { routerData, location } = this.props;
    const { pathname } = location;
    let title = 'Ovrpass';
    if (routerData[pathname] && routerData[pathname].name) {
      title = `${routerData[pathname].name} - Ovrpass`;
    }
    return title;
  }

  render() {
    const { routerData, match } = this.props;
    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.container}>
          <div className={styles.content}>
            <Switch>
              {getRoutes(match.path, routerData).map(item => (
                <Route
                  key={item.key}
                  path={item.path}
                  component={item.component}
                  exact={item.exact}
                />
              ))}
              {/* <Redirect from="/user" to={'/onboarding/plans'} /> */}
              <Redirect from="/user" to={getLoginPathWithRedirectPath()} />
            </Switch>
          </div>
          <GlobalFooter links={links} copyright={copyright} />
        </div>
      </DocumentTitle>
    );
  }
}

export default BlankLayout;
