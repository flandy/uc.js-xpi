// ==UserScript==
// @name     SaveToSaveTiMe.uc.js
// @charset  UTF-8
// @include  chrome://mozapps/content/downloads/unknownContentType.xul
// @include  chrome://browser/content/browser.xul
// @note	 http://pan.baidu.com/share/link?uk=2467242534&shareid=1741821320
// @note	 http://pan.baidu.com/s/1sjJg7Ul
// @note	 changeDownloadname & copyFullnamebyclicking
// @note	 https://github.com/GH-Kelo/userChromeJS/blob/master/.test/newDownloadPlus.uc.js
// @version  [130810]
// ==/UserScript==

if (location == "chrome://mozapps/content/downloads/unknownContentType.xul") {
	
// dbclick save or open
// "radio#open" // "radio#save" // "radio#xThunderRadio" // "radio#turbodta"
var radios = document.querySelectorAll('radio');
for(var rad of radios){
	if(!/^(?:open|save|xThunderRadio|turbodta)$/i.test(rad.id)){
		continue;
	}
	rad.addEventListener("dblclick", function(event) {
		//if(event.target.nodeName === "radio")
		document.documentElement.getButton("accept").click();
	}, false);
}

// dbclick copy download url
var downURL = document.querySelector("#source");
downURL.value = dialog.mLauncher.source.spec;
downURL.setAttribute("crop", "center");
downURL.setAttribute("tooltiptext", dialog.mLauncher.source.spec);
downURL.setAttribute("ondblclick", 'Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper).copyString(dialog.mLauncher.source.spec)');
//downURL.addEventListener("dblclick", function(){ Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper).copyString(dialog.mLauncher.source.spec)} , false);

// add save to
var mainwin = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser");
var Referrer = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI(mainwin.content.document.URL, null, null);
var cssStr = (function(){/*
	button[dlgtype="accept"]::after{
	content:"";
	display:-moz-box;
	width:8px;
	height:19px;
	-moz-appearance: menulist-button;
	}
	button[dlgtype="accept"][disabled]::after{
	opacity:.3;
	}
*/}).toString().replace(/^.+\s|.+$/g,"");
var style = document.createProcessingInstruction("xml-stylesheet", "type=\"text/css\"" + " href=\"data:text/css;base64," + btoa(cssStr) + "\"");
document.insertBefore(style,document.firstChild);

/*set downFile name*/
document.querySelector("#mode").addEventListener("select", function () {
		//http://tieba.baidu.com/p/3124770433
		//if (dialog.dialogElement("save").selected) {
				if (!document.querySelector("#locationtext")) {
						var locationtext = document.querySelector("#location").parentNode.insertBefore(document.createElement("textbox"), document.querySelector("#location"));
						locationtext.id = "locationtext";
						locationtext.setAttribute("style", "margin-top:-2px;margin-bottom:-3px");
						locationtext.value = decodeURI(document.querySelector("#location").value);
						//let converter = Components.classes['@mozilla.org/intl/scriptableunicodeconverter'].getService(Components.interfaces.nsIScriptableUnicodeConverter);
						//converter.charset = "GB18030";	//"GBK", "BIG5", "Shift-JIS"
						//locationtext.value = converter.ConvertToUnicode(document.querySelector("#location").value).replace(/^"(.+)"$/, "$1");
				}
				document.querySelector("#location").hidden = true;
				document.querySelector("#locationtext").hidden = false;
		//} else {
				//document.querySelector("#locationtext").hidden = true;
				//document.querySelector("#location").hidden = false;
		//}
}, false);
dialog.dialogElement("save").selected && dialog.dialogElement("save").click();
window.addEventListener("dialogaccept", function () {
    if ((document.querySelector("#locationtext").value != document.querySelector("#location").value) && dialog.dialogElement("save").selected) {
        mainwin.eval("(" + mainwin.internalSave.toString().replace("let ", "").replace("var fpParams", "fileInfo.fileExt=null;fileInfo.fileName=aDefaultFileName;var fpParams") + ")")(dialog.mLauncher.source.asciiSpec, null, document.querySelector("#locationtext").value, null, null, null, null, null, null, mainwin.document, Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch).getBoolPref("browser.download.useDownloadDir"), null);
        document.documentElement.removeAttribute("ondialogaccept");
    }
}, false);

	
	//***********************目录路径的反斜杠\要双写\\**********************************//
	var dir = [
		["X:", "X"],
		["D:\\TMP", "TMP"],
		["F:\\Installer", "Install"]
	];
	var saveTo = document.documentElement.getButton("accept");
	var popDisAllowed = false;
	var savePopMenu = document.createElement("menupopup");
	saveTo.addEventListener("click", function(event) {
		popDisAllowed = event.button == 0 && event.target.boxObject.x + event.target.boxObject.width - event.clientX < 20;
		if (popDisAllowed) {event.preventDefault();savePopMenu.openPopup(this, "after_pointer", 0, 8, false, false);}
	}, false);
	
	var saveToMenu = saveTo.appendChild(savePopMenu);

	dir.map(function (dir) {
		var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		converter.charset = "GBK";
		var name= converter.ConvertToUnicode(dir[1]);
		dir = converter.ConvertToUnicode(dir[0]);
		var item = saveToMenu.appendChild(document.createElement("menuitem"));
		item.setAttribute("label", (name||(dir.match(/[^\\/]+$/) || [dir])[0]));
		item.setAttribute("image", "moz-icon:file:///" + dir + "\\");
		item.setAttribute("class", "menuitem-iconic");
		item.onclick = function(){
			var filename = (document.querySelector("#locationtext") ? document.querySelector("#locationtext").value.trim() : document.querySelector("#location").value);
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(dir + "\\" + filename);
			if(file.exists() && !confirm("\""+filename+"\"\n"+"\u6587\u4EF6\u5DF2\u5B58\u5728\uFF0C\u662F\u5426\u8986\u76D6\u4E0B\u8F7D\uFF1F")) return false;
			dialog.mLauncher.saveToDisk(file,1);
			dialog.onCancel = function(){};
			close();
		}
	})
	
	saveTo.setAttribute("tooltiptext","\u5DE6\u952E\uFF1A\u786E\u5B9A\u3002\n\u4E2D\u952E\uFF1A\u4FDD\u5B58\u5E76\u6253\u5F00\u3002\n\u53F3\u952E\uFF1A\u6587\u4EF6\u53E6\u5B58\u4E3A\u3002");
	saveTo.addEventListener("click", function(event) {
		if (event.target == this) {
			if (saveTo.type != "menu" || event.button != 0 || event.target.boxObject.x + event.target.boxObject.width - event.clientX > 20) {
				if(event.button == 0){
				}else if(event.button == 1){
					// save and open
					/* Services.wm.getMostRecentWindow("navigator:browser").saveAndOpen.urls.push(dialog.mLauncher.source.asciiSpec);
					document.querySelector("#save").click();
					document.documentElement.getButton("accept").disabled=0;
					document.documentElement.getButton("accept").click(); */
				}else if(event.button == 2){
					mainwin.eval("(" + mainwin.internalSave.toString().replace("let ", "").replace("var fpParams", "fileInfo.fileExt=null;fileInfo.fileName=aDefaultFileName;var fpParams") + ")")
					(dialog.mLauncher.source.asciiSpec, null, document.querySelector("#locationtext").value, null, null, null, null, null, Referrer, mainwin.document, 0, null);
					close();
				}
			}
		}
	}, false);
}