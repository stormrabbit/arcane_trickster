import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { Utility, NavBar } from 'components';
import config from '../../config';
import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import { connect } from 'react-redux';
import * as CommonActions from 'redux/modules/reduxCommon';
const EventEmitter = require('events').EventEmitter;
const event = new EventEmitter();

@connect(
  state => ({
    Title: state.Common.Title,                                          // 标题
    UrlParams: state.Common.UrlParams,                                  // URL参数
    DictStatusName: state.Common.DictStatusName,                        // 字典信息
    TabsFooterInfo: state.Common.TabsFooterInfo,                        // tabsTooter信息
    PageSliderInfo: state.Common.PageSliderInfo,                        // 页面滑动
  }),
  { ...CommonActions })
export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,                                // 子项
    user: PropTypes.object,                                               // 用户信息
    location: PropTypes.object,                                           // location信息
    Title: PropTypes.string,                                              // 标题
    UrlParams: PropTypes.object,                                          // url 参数
    TabsFooterInfo: PropTypes.object,                                     // tabsTooter信息
    PageSliderInfo: PropTypes.object,                                     // 页面滑动
    onAPIHomeConfig: PropTypes.func,                                      // 获取ICom配置信息
    onDictStatusName: PropTypes.func,                                     // 获取字典信息
    onSetNavbarIsShow: PropTypes.func,                                    // 设置是否显示导航条
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    const __IsShow = !!config.app.IsHideNavBar;
    this.state = { index: 0, Title: '', IsReturn: false, IsInitIComAPI: false, IsShow: false, IsWeiXin: __IsShow };

    const { onSetNavbarIsShow, onDictStatusName } = this.props;
    if (Utility.isFunction(onDictStatusName)) {
      onDictStatusName();
    }
    if (Utility.isFunction(onSetNavbarIsShow)) {
      onSetNavbarIsShow(__IsShow);
    }
  }

  componentWillMount() {
    if (this.state.IsWeiXin) {
      Utility.removeContent(Utility.constItem.UserInfo, true);
      Utility.removeContent(Utility.constItem.SaveUserConfigInfo, true);
    }
    // 设置事件
    Utility.setContent(Utility.constItem.Event, event);
    const __self = this;
    Utility.$on(Utility.constItem.Events.OnEditNavBarTitle, (options) => {
      __self.state.Title = options.Title || '';
      __self.forceUpdate();
    });
    Utility.$on(Utility.constItem.Events.OnEditPageSliderInfo, (options) => {
      if (options.Title) {
        __self.state.Title = options.Title;
      }
      __self.state.IsReturn = options.IsReturn || false;
      __self.forceUpdate();
    });
    Utility.$on(Utility.constItem.Events.OnKeyboard, (IsFocus, ee) => {
      const scrollHeight = document.body.scrollHeight;
      const { __IsAdd, __OldMarginBottom, offsetTop } = ee.target;
      const clientHeight = document.body.clientHeight;
      const __scrollTop = 280;
      const __Height = scrollHeight > clientHeight ? scrollHeight : clientHeight;
      const __divApp = __self.refs.divAppMain;
      if (!!IsFocus) {
        if (__Height - offsetTop < __scrollTop) {
          const __MBot = __divApp.style.marginBottom;
          const __New_MBot = parseFloat(__MBot !== '' ? __MBot : 0) + __scrollTop;
          __divApp.style.marginBottom = __New_MBot + 'px';
          document.body.scrollTop = offsetTop + __scrollTop;
          ee.target.__IsAdd = true;
          ee.target.__OldMarginBottom = __MBot;
        }
      } else if (!!__IsAdd) {
        __divApp.style.marginBottom = __OldMarginBottom || '0px';
        delete ee.target.__OldMarginBottom;
        delete ee.target.__IsAdd;
      }
    });
  }

  componentDidMount() {
  }

  shouldComponentUpdate(nextProps, nextState) {
    const _nextIsReturn = nextState.IsReturn;
    const _nextTitle = nextState.Title;
    const { Title, IsReturn } = this.state;
    const __Result = _nextIsReturn !== IsReturn || _nextTitle !== Title;
    return __Result;
  }

  getTransitionsName(isReturn, styles) {
    const __tranName = {};
    if (isReturn) {
      __tranName.enter = styles.spEnterReturn;
      __tranName.enterActive = styles.spEnterActiveReturn;
      __tranName.leave = styles.spLeaveReturn;
      __tranName.leaveActive = styles.spLeaveActiveReturn;
      __tranName.appear = styles.spAppearReturn;
      __tranName.appearActive = styles.spAppearActiveReturn;
    } else {
      __tranName.enter = styles.spEnter;
      __tranName.enterActive = styles.spEnterActive;
      __tranName.leave = styles.spLeave;
      __tranName.leaveActive = styles.spLeaveActive;
      __tranName.appear = styles.spAppear;
      __tranName.appearActive = styles.spAppearActive;
    }
    return __tranName;
  }


  render() {
    const styles = require('./App.scss');
    const { Title, IsReturn, IsWeiXin, IsShow } = this.state;
    const IsStop = Utility.getContent(Utility.constItem.IsStopSlidePageAnimation);
    const __timeout = !!IsStop ? 1 : 500;
    return (
      <div className={styles.app + ' ' + (IsShow ? styles.show : '')}>
        <Helmet {...config.app.head} title={Title} />
        <NavBar Title={Title} IsWeiXin={IsWeiXin} />

        <div className={!!IsWeiXin ? styles.isWeiXin : styles.appContent} ref="divAppMain">
          <ReactCSSTransitionGroup component="div"
            transitionName={!!IsStop ? 'demo' : this.getTransitionsName(!!IsReturn, styles)}
            transitionAppear
            transitionAppearTimeout={__timeout}
            transitionEnterTimeout={__timeout}
            transitionLeaveTimeout={__timeout}>
            {React.cloneElement(this.props.children, { key: this.props.location.pathname })}
          </ReactCSSTransitionGroup>
        </div>
      </div>
    );
  }
}
