/**
 * Created by admin on 2016-09-21.
 */
import React, { Component, PropTypes } from 'react';
import { Utility, DefHref } from 'components';
import { connect } from 'react-redux';
import * as CommonActions from 'redux/modules/reduxCommon';

@connect(
  state => ({
    Title: state.Common.Title,                                          // 标题
    UrlParams: state.Common.UrlParams,                                 // URL参数
    IComConfig: state.Common.IComConfig,                                // 配置信息
  }),
  { ...CommonActions })
export default class Default extends Component {
  static propTypes = {
    Title: PropTypes.string,                                              // 标题
    UrlParams: PropTypes.object,                                         // url 参数
    IComConfig: PropTypes.object,                                        // 配置信息
  };

  constructor(props) {
    super(props);

    this.state = { RefreshComplete: true, NextDataComplete: true, UA: navigator.userAgent };

    // const version = Utility.$androidVersion();
    // console.log(version);
  }

  componentDidMount() {
    Utility.$keyboardEvent(this, React);
  }


  /**
   * 跳转
   * @param params
   * @private
   */
  __HandlerGoToPage(url, params) {
    Utility.toPage(url, params);
  }
  __HandlerReadConfig() {
    try {
      const data = Utility.getContent(Utility.constItem.SaveUserConfigInfo);
      const __Value = JSON.stringify(data);
      this.setState({ __Content: __Value });
    } catch (ex) {
      console.log(ex);
    }
  }

  render() {
    const styles = require('./scss/Default.scss');
    return (
      <div className={styles.defaultCss}>
        aaaaaaaaaaaa
        <DefHref />
      </div>
    );
  }
}

