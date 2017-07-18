/**
 * Created by admin on 2016-08-16.
 */
import React, { Component, PropTypes } from 'react';
import { Utility } from 'components';
/**
 * 箭头
 * @example
 * <ActionSheetModel
 *    Title = '标题'                                                                --------1> 不能为空
 *    ContentInfo = {                                                               --------2> 不能为空
 *                      Content:'这里填写内容',                                      --------2> ------1> 显示的内容
 *                      eventName: this.handlerClickContentEvent.bind(this)         --------2> ------2> 点击内容事件,可以不填
 *                  }
 *    Buttons = [                                                                   --------3> 可以为空
 *                {
 *                  Title: '测试按键1',                                              --------3> ------1> 按钮内容
 *                  funName: this.handlerButton1ClickEvent.bind(this)               --------3> ------2> 按键事件
 *                },
 *                {Title: '测试按键2', funName: this.handlerButton2ClickEvent.bind(this)}
 *              ]
 *    onClose = {this.handlerClose.bind(this)}                                      --------4> 可以为空
 *    ToPage = {                                                                    --------5> 可以为空
 *                Url: Utility.constItem.UrlItem.Login,                             --------5> -----1>这里是页面跳转的地址
 *                Options: {}                                                       --------5> -----2>页面跳转的传的参数
 *              }
 *    />
 */
export default class ActionSheetModel extends Component {
  static propTypes = {
    ContentInfo: PropTypes.object,
    Title: PropTypes.string,
    Buttons: PropTypes.array,
    ToPage: PropTypes.object,
    onClose: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    // const {ToPage} = this.props;
    setTimeout(() => {
      this.setState({ IsShowAction: true });
    }, 50);
    // 三秒后自动关闭。
    this.state.__Timeout = setTimeout(() => {
      Utility.$emit(Utility.constItem.Events.ShowModel.OnActionSheetHide);
      // --> 判断是否要进行页面跳转,页面跳转的时候，参数传值问题  1.5 秒后进行页面跳转
      this.__HandlerToPage(1500);
    }, 3000);
  }

  componentWillUnmount() {
    clearTimeout(this.state.__Timeout);
    clearTimeout(this.state.__Timeout2);
  }

  __HandlerToPage(times) {
    const {ToPage} = this.props;
    const {Url, Options} = ToPage || {};
    if (!Url) {
      return;
    }
    // 1.5 秒后进行页面跳转
    this.state.__Timeout2 = setTimeout(() => {
      Utility.toPage(Url, Options || {});
    }, times || 0);
  }

  __HandlerClose() {
    this.setState({ IsShowAction: false });
    const {onClose} = this.props;
    this.__HandlerToPage(10);

    if (Utility.isFunction(onClose)) {
      setTimeout(() => {
        onClose();
      }, 200);
    }
  }

  handlerContentEvent() {
    const {ContentInfo} = this.props;
    if (Utility.isFunction(ContentInfo.event)) {
      ContentInfo.event(ContentInfo);
    }
  }

  handlerButton(item) {
    if (Utility.isFunction(item.funName)) {
      item.funName(item);
    }
  }

  render() {
    const styles = require('./scss/ActionSheetModel.scss');
    const {Title, ContentInfo, Buttons} = this.props;
    const {IsShowAction} = this.state;

    let __ButtonItem = '';
    if (Buttons && Buttons.length > 0) {
      __ButtonItem = Buttons.map((item, __index) => {
        return (<div key={'actionSheet_button_index_' + __index} className={styles.buttons}>
          <div className={styles.splitLine}></div>
          <div className={styles.content} onClick={this.handlerButton.bind(this, item)}>{item.Title}</div>
        </div>);
      });
    }
    return (
      <div className={styles.content} ref="exoudsActionSheet">
        <div className={styles.background} onClick={this.__HandlerClose.bind(this)}></div>
        <div className={styles.leilong + ' ' + (!!IsShowAction ? styles.showAction : '')}>
          <div className={styles.subLeiLong}>
            <div className={styles.title}>{Title}</div>
            <div className={styles.splitLine}></div>
            <div className={styles.content} onClick={this.handlerContentEvent.bind(this)}>{ContentInfo.Content}</div>
            {__ButtonItem}
          </div>
        </div>
      </div>
    );
  }
}
