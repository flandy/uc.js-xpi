// ==UserScript==
// @include chrome://browser/content/browser.xul
// @note midClick stay collapse
// ==/UserScript==

/* document.getElementById('appmenu-popup').addEventListener('popupshowing', function () {
        document.getElementById('appmenu-popup').removeEventListener('popupshowing', arguments.callee, false);
        document.getElementById('appmenuSecondaryPane').insertBefore(
        document.getElementById('tools-menu').cloneNode(true), document.getElementById('appmenu_help'))
}, false); */

try {
eval('BookmarksEventHandler.onClick = ' + BookmarksEventHandler.onClick.toString().replace('node.hidePopup()',''));
eval('checkForMiddleClick = ' + checkForMiddleClick.toString().replace('closeMenus(event.target);',''));
}catch(e) {};