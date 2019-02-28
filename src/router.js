import React from 'react';
import { routerRedux, Route, Switch } from 'dva/router';
import { LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import { getRouterData } from './common/router';
import Authorized from './utils/Authorized';
import { getQueryPath } from './utils/utils';

const { ConnectedRouter } = routerRedux;
const { AuthorizedRoute } = Authorized;
import { StripeProvider, Elements } from 'react-stripe-elements';

function RouterConfig({ history, app }) {
  const routerData = getRouterData(app);
  const UserLayout = routerData['/user'].component;
  const BlankLayout = routerData['/onboarding'].component;
  const BasicLayout = routerData['/'].component;
  return (
    <StripeProvider apiKey="pk_live_2NPgN72BUHZtkTDAdnkvHvKQ">
      <Elements>
        <LocaleProvider locale={enUS}>
          <ConnectedRouter history={history}>
            <Switch>
              <Route path="/user" component={UserLayout} />
              <Route path="/onboarding" component={BlankLayout} />
              <AuthorizedRoute
                path="/"
                render={props => <BasicLayout {...props} />}
                authority={['admin', 'user']}
                redirectPath={getQueryPath('/user/login', {
                  redirect: window.location.href,
                })}
              />
            </Switch>
          </ConnectedRouter>
        </LocaleProvider>
      </Elements>
    </StripeProvider>
  );
}

export default RouterConfig;
