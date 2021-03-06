import React, {Component} from 'react';
import * as PropTypes from 'prop-types';
import {change} from 'redux-form';

import {
  FormDataConsumer,
  FormTab,
  GET_LIST,
  Labeled,
  LinearProgress,
  ReferenceInput,
  SelectInput,
  TextInput
} from 'react-admin';
import {withStyles} from '@material-ui/core';
import {updateAddress} from '../../utils';
import AddressFields from '../../Reports/AddressFields';
import restClient from '../../grailsRestClient';
import CustomerNameAutocomplete from './CustomerNameAutocomplete';

const dataProvider = restClient;
const styles = {

  inlineBlock: {display: 'inline-flex', marginRight: '1rem'},
  halfDivider: {
    flexGrow: 1,
    height: '2px',
    backgroundColor: 'rgba(0,0,0,0.25)'
  },
  dividerContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    verticalAlign: 'middle',
    alignItems: 'center'
  },
  orText: {
    margin: '10px'
  },
  addressContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row'
  },
  addressContainerLabeled: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column'
  },
  addressComponent: {
    flexGrow: '1',
    marginRight: '1rem'
  }

};

class YearSelect extends Component {
  render () {
    if (this.props.loading) {
      return (
        <Labeled
          label={'Year to add to'}
          source={'year'}
        >
          <LinearProgress/>
        </Labeled>
      );
    }
    return <SelectInput label='Year to add to' optionText='year' source='year' choices={this.props.choices}
      isLoading={this.props.loading} defaultValue={(this.props.choices[0] || {id: null}).id}/>;
  }
}

YearSelect.propTypes = {
  choices: PropTypes.any,
  loading: PropTypes.bool
};

class InfoTab extends Component {
  constructor (props) {
    super(props);
    this.state = {address: '', zipCode: '', city: '', state: '', update: 0, years: [], loadingYear: true, runningTotal: 0.0};
  }

  updateAddress = (address) => {
    let addressObj = updateAddress(address);
    this.setState({...addressObj, update: 1});
  };
  updateInfo = (dispatch) => (info) => {
    dispatch(change('record-form', 'streetAddress', info.address));
    dispatch(change('record-form', 'city', info.city));
    dispatch(change('record-form', 'state', info.state));
    dispatch(change('record-form', 'zipCode', info.zipCode));
    dispatch(change('record-form', 'phone', info.phone));
    dispatch(change('record-form', 'custEmail', info.custEmail));
  };

  getYears () {
    dataProvider(GET_LIST, 'Years', {
      filter: {},
      sort: {field: 'year', order: 'DESC'},
      pagination: {page: 1, perPage: 1000}
    }).then(response => {
      this.setState({years: response.data, loadingYear: false});
    });
  }
  renderCreateOrEditFields () {
    const {classes, ...props} = this.props;

    if (!this.props.edit) {
      return (
        <div>
          {/*          <ReferenceInput label='Year to add to' source='year' reference='Years'
            formClassName={classes.inlineBlock} {...props} defaultValue={6}> */}
          <YearSelect choices={this.state.years} loading={this.state.loadingYear}/>
          {/*          </ReferenceInput> */}

          <ReferenceInput label='User to add to' source='user' reference='user'
            formClassName={classes.inlineBlock} {...props}>
            <SelectInput optionText='fullName' optionValue='id'/>
          </ReferenceInput>

        </div>
      );
    }
  }

  render () {
    const {classes, ...props} = this.props;

    return <FormTab label={'Info'} {...props}>

      <FormDataConsumer className={classes.addressComponent} {...props}>
        {({formData, ...rest}) => {
          if (this.state.update === 1) {
            this.setState({update: 0});
            rest.dispatch(change('record-form', 'streetAddress', this.state.address));
            rest.dispatch(change('record-form', 'city', this.state.city));
            rest.dispatch(change('record-form', 'state', this.state.state));
            rest.dispatch(change('record-form', 'zipCode', this.state.zipCode));
          }
          return (<CustomerNameAutocomplete label='Customer Name' source='customerName' formClassName={classes.inlineBlock} updateCustInfo={this.updateInfo(rest.dispatch)}/>
          );
        }}
      </FormDataConsumer>
      <TextInput source='phone' formClassName={classes.inlineBlock}/>
      <TextInput source='custEmail' formClassName={classes.inlineBlock}/>
      <span/>
      {this.renderAddressFields()}

      <span/>

      <TextInput label='Donation' source='donation' formClassName={classes.inlineBlock}/>

      <span/>
      {this.renderCreateOrEditFields()}
    </FormTab>;
  }

  renderAddressFields () {
    const {classes, ...props} = this.props;

    return (<FormDataConsumer className={classes.addressComponent} {...props}>
      {({formData, ...rest}) => {
        if (this.state.update === 1) {
          this.setState({update: 0});
          rest.dispatch(change('record-form', 'streetAddress', this.state.address));
          rest.dispatch(change('record-form', 'city', this.state.city));
          rest.dispatch(change('record-form', 'state', this.state.state));
          rest.dispatch(change('record-form', 'zipCode', this.state.zipCode));
        }
        return (<AddressFields updateAddress={this.updateAddress} value={this.state.address}/>);
      }}
    </FormDataConsumer>);
  }

  componentDidMount () {
    this.getYears();
  }
}

InfoTab.propTypes = {
  classes: PropTypes.any,
  save: PropTypes.func,
  edit: PropTypes.bool
};
InfoTab.defaultProps = {
  edit: false
};
InfoTab.propTypes = {};

export default (withStyles(styles, {withTheme: true})(InfoTab));
