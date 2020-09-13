import * as React from 'react';

import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import { Spinner } from 'office-ui-fabric-react/lib/Spinner';

import Subscription from '../Subscription/Subscription';

import { sp } from '@pnp/sp';
import '@pnp/sp/items';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/fields/list";
import { WebPartContext } from '@microsoft/sp-webpart-base';

interface IState {
  subscriptionsList: any[];
  isLoading: Boolean;
}

interface IProps {
  context: WebPartContext;
}

export class Subscriptions extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      subscriptionsList: [],
      isLoading: true
    };
  }

  public async componentDidMount() {
    sp.setup({
      spfxContext: this.props.context
    });
    try {
      const items = await sp.web.lists.getByTitle("Subscriptions").items
          .select('Title', 'ID', 'subscriptionPrice', 'subscriptionDescription', 'subscriptionType',  'responsible/Title', 
                  'discount/Title', 'discount/discountNum', 'discount/Id')
          .expand('responsible', 'discount')
          .get(); 
      this.setState({
        subscriptionsList: items,
        isLoading: false
      });
    }
    catch (err) {
      console.error(err); 
    }
  }

  protected createSubscriptionsPivotItems() {
    return this.state.subscriptionsList.map((item, i) => 
      <PivotItem key={i} headerText={item.Title} children={<Subscription item={item}/>}/>
    );
  }

  public render() {
    return <>
    {this.state.isLoading ? 
      <Spinner label="Yeah, still loading..."/> 
      : 
      <Pivot aria-label="Subscriptions">
        {this.createSubscriptionsPivotItems()}
      </Pivot>
    }
    </>;
     
  }
}
