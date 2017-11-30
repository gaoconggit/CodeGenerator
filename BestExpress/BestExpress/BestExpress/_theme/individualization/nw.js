/// <reference path="../tool/_reference.js" />
localStorage.currentCompanyName = "neway";
var $nw_maintenanceBasicInfo = function () {
    var times = 1000;
    var second = 1;
    this.init = function () {
        addEvent();
    };
    var selector = {
        $positontype: function () { return $("#PositonType"); },
        $specialty: function () { return $("#Specialty"); },
        $household: function () { return $("#Household"); },
        $transfertype: function () { return $("#TransferType"); },
        $transferstatus: function () { return $("#TransferStatus"); },
        $basicinfofiletransferindate: function () { return $("#BasicInfoFileTransferInDate"); },
        $politicallandscape: function () { return $("#PoliticalLandscape"); },
        $companyworkyearcalctype: function () { return $("#CompanyWorkYearCalcType"); },
        $socialsecurityaccount: function () { return $("#SocialSecurityAccount"); },
        $providentfundaccount: function () { return $("#ProvidentFundAccount"); },
        $bankname: function () { return $("#BankName"); },
        $residenceaddress: function () { return $("#ResidenceAddress"); },
        $idNo: function () { return $("#IDNo"); },
        $mobilephonenum: function () { return $("#MobilePhoneNum"); },
        $fixphonenum: function () { return $("#FixPhoneNum"); },
        $idtype: function () { return $("#IDType"); }
    }
    function addEvent() {
        hiddenText();
    }
    function hiddenText() {
       
        $.action.setTimeoutWidthNum(function () {
            selector.$positontype().after("—"),
            selector.$positontype().hide(),
            selector.$specialty().after("—"),
            selector.$specialty().hide(),
            selector.$household().after("—"),
            selector.$household().hide(),
            selector.$transfertype().after("—"),
            selector.$transfertype().hide(),
            selector.$transferstatus().after("—"),
            selector.$transferstatus().hide(),
            selector.$basicinfofiletransferindate().after("—"),
            selector.$basicinfofiletransferindate().hide(),
            selector.$politicallandscape().after("—"),
            selector.$politicallandscape().hide(),
            selector.$companyworkyearcalctype().after("—"),
            selector.$companyworkyearcalctype().hide(),
            selector.$socialsecurityaccount().after("—"),
            selector.$socialsecurityaccount().hide(),
            selector.$providentfundaccount().after("—"),
            selector.$providentfundaccount().hide(),   
            selector.$bankname().after("—"),
            selector.$bankname().hide()
            selector.$residenceaddress().after("—"),
            selector.$residenceaddress().hide()
            selector.$idNo().after("—"),
            selector.$idNo().hide()
            selector.$mobilephonenum().after("—"),
            selector.$mobilephonenum().hide()
            selector.$fixphonenum().after("—"),
            selector.$fixphonenum().hide()
            selector.$idtype().after("—"),
            selector.$idtype().hide()
        }, times, second)
    }
};

var $nw_selfservice = function ()
{
    this.init = function ()
    {
        addEvent();
    }
    var selector = {
        $dateFrom: function () { return $("#DateFrom") },
        $dateTo: function () { return $("#DateTo") },
        $timeFrom: function () { return $("#TimeFrom") },
        $timeTo: function () { return $("#TimeTo") },
        $hours: function () { return $("#Hours") },
        $days: function () { return $("#DAYS") },
    };
    function addEvent()
    {
    }
}
$(function () {
    
    if ($.request.areaName().ejq_TryToLower() == "personnel") {
        if ($.request.controllerName().ejq_TryToLower() == "maintenancebasicinfo"
            && $.request.actionName().ejq_TryToLower() == "index") {
            var nw_maintenanceBasicInfo = new $nw_maintenanceBasicInfo();
            nw_maintenanceBasicInfo.init();
        } else if ($.request.controllerName().ejq_TryToLower() == "perdetail"
            && $.request.actionName().ejq_TryToLower() == "index") {
            var nw_perdetail = new $nw_maintenanceBasicInfo();
            nw_perdetail.init();
        } else if ($.request.controllerName().ejq_TryToLower() == "maintenancesalaryinfo"
            && $.request.actionName().ejq_TryToLower() == "index") {
            var nw_maintenancesalaryinfo = new $nw_maintenanceBasicInfo();
            nw_maintenancesalaryinfo.init();
        } else if ($.request.controllerName().ejq_TryToLower() == "maintenancecontactinfo"
            && $.request.actionName().ejq_TryToLower() == "index") {
            var nw_maintenancecontactinfo = new $nw_maintenanceBasicInfo();
            nw_maintenancecontactinfo.init();
        }
    }
    if ($.request.areaName().ejq_TryToLower() == "selfservice")
    {
        if($.request.controllerName().ejq_TryToLower() == "LeaveBillSaveApply"
            && $.request.actionName().ejq_TryToLower() == "index")
        {
            var nw_maintenanceBasicInfo = new $nw_selfservice();
            nw_maintenanceBasicInfo.init();
        }
    }
});


