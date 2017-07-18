/**
 * Created by admin on 2016-07-13.
 */
import Utility from '../../Common/Utility';

const __Base = 'GOCOM/WP/Common/';
const Load = __Base + 'Load';
const LoadSuccess = __Base + 'LoadSuccess';
const LoadFail = __Base + 'LoadFail';

const EditPageSliderInfo = __Base + '/EditPageSliderInfo';
const SetNavbarIsShow = __Base + '/SetNavbarIsShow';
const _BaseNBEditTitle = __Base + 'NavBar/';
const NbTitleEdit = _BaseNBEditTitle + 'Title_Edit';
const NbTitleInfo = _BaseNBEditTitle + 'Title_Info';
const DictStatusName = __Base + 'DictStatusName';

/**
 * 设置变量操作
 * @type {string}
 */
const OnSetContent = __Base + 'OnSetContent';
const UrlParamsEdit = __Base + 'UrlParamsEdit';

// const __API = __Base + 'API/';


const initialState = {
  loaded: false
};

export default function reducer(state = initialState, action = {}) {
  const __Result = { ...state };
  if (action.result) {      // 这里就是请求完成了
    Object.assign(__Result, { loading: false, loaded: true });
    __Result.Result = action.result;
  }
  if (action.error) {     // 请求完了之后出错信息
    Object.assign(__Result, { loading: false, loaded: false });
    __Result.Error = action.error;
  }
  switch (action.type) {
    case SetNavbarIsShow:                                                             // 导航条是否显示
      __Result.IsHideNavBar = !!action.IsShow;
      break;
    case DictStatusName:                                                              // 状态字典 
      __Result.DictStatusName = Utility.constItem.Status.StatusName;
      break;
    case OnSetContent:
      __Result[action.Key] = action.Value;
      break;
    case EditPageSliderInfo:                                                             // 页面是否切换滑动方向
      const PageSliderInfo = __Result.PageSliderInfo || {};
      PageSliderInfo.IsReturn = action.IsReturn;
      __Result.PageSliderInfo = PageSliderInfo;
      break;
    case Load:                                                                         // 加载
      __Result.loading = true;
      break;
    case LoadSuccess:                                                                 // 加载成功
      __Result.data = action.result;
      break;
    case NbTitleInfo:                                                                     // 修改标题,是否显示返回按键
      __Result.Title = action.Title || '默认标题';
      __Result.IsShowBackArrow = action.IsShowBackArrow ? action.IsShowBackArrow : false;
      break;
    case NbTitleEdit:                                                                    // 修改标题
      __Result.Title = action.Title || '默认标题';
      break;
    case UrlParamsEdit:                                                                  // url 参数
      __Result.UrlParams = action.query;
      break;
    case LoadFail:                                                                       // 加载失败
      break;
    default:
  }
  return __Result;
}

/**
 * 设置导航条是否显示
 * 
 * @export
 * @param {bool} IsShow true:显示，false:不显示
 * @returns
 */
export function onSetNavbarIsShow(IsShow) {
  return { type: SetNavbarIsShow, IsShow: IsShow };
}

/**
 * 保存信息到 store里面去。
 * @param key
 * @param value
 * @returns {{type: string, Key: *, Value: *}}
 */
export function onSetContent(key, value) {
  return { type: OnSetContent, Key: key, Value: value };
}

/**
 * 页面滑动切换
 * @param row
 * @returns {{type: string, IsReturn: boolean}}
 */
export function onPageSliderInfo(row) {
  const { IsReturn } = row || {};
  return {
    type: EditPageSliderInfo,
    IsReturn: (IsReturn || false),
  };
}

/**
 * 修改导航条信息，标题，是否显示返回按钮
 * @param row
 * @returns {{type: string, Title: *, IsShowBackArrow: (*|boolean)}}
 */
export function onNavBarTitleInfo(row) {
  return { type: NbTitleInfo, Title: row.Title, IsShowBackArrow: row.IsShowBackArrow };
}

/**
 * 修改标题
 * @param row
 * @returns {{type: string, Title: *}}
 */
export function onNavBarTitleEdit(row) {
  return { type: NbTitleEdit, Title: row.Title };
}

/**
 * 保存当前当前url参数
 * @param row
 * @returns {{type: string, query: *}}
 */
export function onUrlParamsEdit(row) {
  return { type: UrlParamsEdit, query: row };
}

/**
 * 状态字典
 * 
 * @export
 * @returns
 */
export function onDictStatusName() {
  return { type: DictStatusName };
}
