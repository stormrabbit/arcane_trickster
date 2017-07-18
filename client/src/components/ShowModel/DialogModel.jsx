/**
 * Created by admin on 2016-08-24.
 */
import React, { Component, PropTypes } from 'react';
import { Utility } from 'components';
/**
 * 确定--取消
 *
 *  <ConfirmModel
 *      Title="订单管理"
 *      Content = "真的删除订单吗？"
 *      okButton = {this.handler.bind(this)}
 *      cancelButton = {this.handler.bind(this)}   --> 如果没有传此方法的时候，就是
 *      okButtonTitle = "确定" --> 不填写时：默认为 “确定”
 *      cancelButtonTitle = "取消"  --> 不填写时：默认为“取消”
 *      />
 *
 */
export default class ConfirmModel extends Component {
  static propTypes = {
    children: PropTypes.object,                                     // 子项
    Title: PropTypes.string,                                        // 标题
    okButtonTitle: PropTypes.string,                                // 确定 button标题
    cancelButtonTitle: PropTypes.string,                            // 取消 button 标题
    okButton: PropTypes.func,                                       // 确定 button 事件
    cancelButton: PropTypes.func,                                   // 取消 button 事件
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const __self = this;
    setTimeout(() => {
      __self.setState({ isShowAction: true });
    }, 50);
  }

  /**
   * 关闭窗体
   * @private
   */
  __HandlerCancelButton() {
    const {cancelButton} = this.props;
    this.setState({ isShowAction: false });
    setTimeout(() => {
      Utility.$emit(Utility.constItem.Events.ShowModel.OnConfirmHide);
      if (!Utility.isFunction(cancelButton)) {
        return;
      }
      cancelButton();
    }, 200);
  }

  /**
   * 点击确定按钮后，关闭当前窗体。
   * @private
   */
  __HandlerOkButton() {
    if (Utility.isFunction(this.props.okButton)) {
      this.props.okButton();
      this.__HandlerCancelButton();
    }
  }

  /**
   * 此方法，是为了防止，底层DIV滚动用的。
   * @param ee
   * @private
   */
  __HandlerOnScroll(IsStop, ee) {
    const {target} = ee;
    const {scrollTop, scrollHeight} = target || {};
    if ((scrollTop + 300) >= scrollHeight) {
      ee.stopPropagation();
      ee.preventDefault();
      // return;
    }
  }

  __HandlerTouchMove(ee) {
    const {target} = ee;
    const __div = this.refs.divTemplate;
    if (target === __div) {
      const {scrollHeight} = __div || {};
      if (scrollHeight < 300) {
        ee.stopPropagation();
        ee.preventDefault();
      } else {
        this.__HandlerEnd(ee);
      }
    } else {
      ee.stopPropagation();
      ee.preventDefault();
    }
  }


  /**
   * 向下
   * 
   * @param {any} ee
   * 
   * @memberOf ConfirmModel
   */
  __HandlerDown(ee) {
    const {target} = ee;
    const __div = this.refs.divTemplate;
    if (target === __div) {
      const {scrollTop} = __div || {};
      if (scrollTop < 10) {
        ee.stopPropagation();
        ee.preventDefault();
      }
    } else {
      ee.stopPropagation();
      ee.preventDefault();
    }
  }

  /**
   * 向上
   * 
   * @param {any} ee
   * 
   * @memberOf ConfirmModel
   */
  __HandlerUp(ee) {
    const {divTemplate, divBtnOk, divBtnCancel} = this.refs;
    const {target} = ee;
    if (target === divTemplate || target === divBtnOk || target === divBtnCancel) {
      const {scrollTop, scrollHeight} = divTemplate || {};
      if ((scrollHeight < 300 || (scrollTop + 300) >= scrollHeight - 10) && target === divTemplate) {
        ee.stopPropagation();
        ee.preventDefault();
      }
    } else {
      ee.stopPropagation();
      ee.preventDefault();
    }
  }

  /**
   * 开始移动
   * 
   * @param {any} event
   * 
   * @memberOf Refresh
   */
  __HandlerStart(event) {
    this.setState({ startX: event.touches[0].clientX, startY: event.touches[0].clientY });
  }

  /**
   * 移动结束
   * 
   * @param {any} event
   * @returns
   * 
   * @memberOf Refresh
   */
  __HandlerEnd(event) {
    const {startX, startY} = this.state;
    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;

    const xes = endX - startX;
    const yes = endY - startY;

    const absXes = Math.abs(xes);
    const absYes = Math.abs(yes);
    // if (absXes < 10 && absYes < 10) {
    //   // Utility.$actionSheet('absXes: ' + absXes + '; absYes: ' + absYes);
    //   return;
    // }
    if (xes > 0) {
      // 右
      if (yes > 0) {
        // 向下
        // 判断主向
        if (absXes > absYes) {
          // 向右。
        } else {
          // 向下。
          this.__HandlerDown(event);
        }
      } else {
        // 向上
        if (absXes > absYes) {
          // 向右。
        } else {
          // 向上。
          this.__HandlerUp(event);
        }
      }
    } else {
      // 左边
      if (yes > 0) {
        // 向下
        if (absXes > absYes) {
          // 向右。
        } else {
          // 向下。
          this.__HandlerDown(event);
        }
      } else {
        // 向上
        if (absXes > absYes) {
          // console.log('向左');
        } else {
          // console.log('向左-->向上');
          this.__HandlerUp(event);
        }
      }
    }
  }

  render() {
    const styles = require('./scss/ConfirmModel.scss');
    const {Title, children, okButtonTitle, cancelButtonTitle} = this.props;
    const {isShowAction} = this.state;
    return (
      <div className={styles.content} ref="exoudsConfirmModel">
        <div className={styles.background}></div>
        <div ref="divContent" className={styles.leilong}
          onTouchStart={this.__HandlerStart.bind(this)}
          onTouchEnd={this.__HandlerEnd.bind(this)}
          onTouchMove={this.__HandlerTouchMove.bind(this)}>
          <div className={styles.subLeiLong + ' ' + (!!isShowAction ? styles.showAction : '')}>
            <div className={styles.title}>{Title}</div>
            <div className={styles.splitLine}></div>
            <div ref="divTemplate" className={styles.template}>{children}</div>
            <div className={styles.buttonInfo}>
              <div ref="divBtnOk" className={styles.okButton}
                onClick={this.__HandlerOkButton.bind(this)}>{okButtonTitle || '确认'}</div>
              {
                !!IsHideCancel ? null :
                  <div ref="divBtnCancel" className={styles.cancelButton}
                    onClick={this.__HandlerCancelButton.bind(this)}>{cancelButtonTitle || '取消'}</div>
              }
            </div>
          </div>
        </div>
      </div>
    );
  }
}
