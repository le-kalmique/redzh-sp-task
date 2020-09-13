import * as React from 'react';
import { ISubscriptionsInfoProps } from './ISubscriptionsInfoProps';
import {Subscriptions} from '../Subscriptions/Subcriptions';

export default class SubscriptionsInfo extends React.Component<ISubscriptionsInfoProps, {}> {
  public render(): React.ReactElement<ISubscriptionsInfoProps> {
    return (
      <div>
        <h2>Offered Subscriptions</h2>
        <Subscriptions context={this.props.context}/>
      </div>
    );
  }
}
