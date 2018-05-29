/*
 * @Author: Query 
 * @Date: 2018-04-19 10:55:31 
 * @Last Modified by: Query
 * @Last Modified time: 2018-05-28 13:35:30
 */

 //测试环境

/* var apiUrl = "https://dev-browser-plugin.qiang100.com/";
var siteUrl = "https://dev-www.qiang100.com/";
 */

//线上环境

var apiUrl = "https://browser-plugin.qiang100.com/";
var siteUrl = "https://www.qiang100.com/"; 

var content = {

    init(){
        var _this =this;
        var oHref = window.location.href;

        if (oHref.indexOf('https://item.jd.com/') > -1) {
            //alert('进入京东详情页')
            _this.enterJD()

        }else if (oHref.indexOf('https://detail.tmall.com') > -1) {
            //alert('进入天猫详情页')
            _this.enterTamll()
        }else{
            return null;
        }

    },


    enterTamll:function(){

        var brandUrl,
            shopName,
            name,
            brandName = '',
            _this = this;
            _this.appendContent('.tm-ind-panel'); //传入追加天猫标签位置

            

        var timer = setInterval(function () {
            brandUrl = encodeURIComponent(window.location.href);
            shopName = encodeURIComponent($('.shopLink').text().trim());   //天猫店铺名称
            name = encodeURIComponent($('.tb-detail-hd h1').text().trim()) || encodeURIComponent($('.tb-detail-hd h1 a').text().trim());  //天猫商品名
            brandName = encodeURIComponent($('.J_EbrandLogo').text().trim()) || encodeURIComponent($('#J_attrBrandName').text().trim().substring(3)); //天猫品牌名称

            if (brandUrl && name && brandName ) { //确认已获取页面品牌信息
                console.log('已获取全部参数')
                console.log(brandName + "\n" + name + "\n" + brandUrl + "\n" + shopName)
                //_this.appendContent('.tm-ind-panel');  //传入追加天猫标签位置

                _this.tabToggle('.content-list li', '.content-tab .div-list');
                _this.appendPriceLine(brandUrl);
                _this.appendAllPricce(brandUrl);
                _this.appendEvaluateInfo(brandUrl);
                _this.appendBrandInfo(name, brandName, brandUrl);
                clearInterval(timer);
            } else {
                //return false;
                console.log('参数获取不完整')

            }
        }, 100);
    },

    enterJD:function(){

        var brandUrl,
            shopName,
            name,
            brandName = '',
            _this = this;
            _this.appendContent('#summary-weight'); //传入追加京东标签位置

            

        var timer = setInterval(function () {
            brandUrl = encodeURIComponent(window.location.href);
            shopName = encodeURIComponent($('.popbox-inner h3 a').text().trim()); //京东店铺名称

            name = encodeURIComponent($('.sku-name').text().trim())   //京东商品标题

            brandName = encodeURIComponent($('.p-parameter-list li a').text().trim())  //京东品牌名称


            if (brandUrl && name && brandName) { //确认已获取页面品牌信息
                console.log('已获取全部参数')
                console.log(brandName + "\n" + name + "\n" + brandUrl + "\n" + shopName)
                //_this.appendContent('#summary-weight'); //传入追加京东标签位置

                _this.tabToggle('.content-list li', '.content-tab .div-list')
                _this.appendPriceLine(brandUrl)
                _this.appendAllPricce(brandUrl)
                _this.appendEvaluateInfo(brandUrl)
                _this.appendBrandInfo(name, brandName, brandUrl)
                clearInterval(timer);
            } else {
                //return false;
                console.log('参数获取不完整')

            }
        }, 100);

    },

    appendContent: function (appendPosi) {   //传入页面追加div位置

        
        var contentDiv = $('\
            <div class="contentDiv">\
                <a class = "content-logo" href = "https://www.qiang100.com/zhi/" target="_blank" > <img src = "https://browser-plugin.qiang100.com/v2/assets/img/content-logo.png" > </a>\
                <ul class="content-list">\
                    <li class="content-li content-price-line" >价格走势\
                        <div class="div-list price-line"></div>\
                    </li>\
                    <li class="content-li content-price-all">全网比价\
                        <div class="div-list price-all"></div>\
                    </li class="content-li">\
                    <li class="content-li">看好评率\
                        <div class="div-list evaluate-wrapper"></div>\
                    </li>\
                    <li class="content-li">品牌详情\
                        <div class="div-list brand-wrapper">\
                            <div class="brand-info"> \
                                <div class="brand-app" > \
                                    <p> <img src = "'+ apiUrl +'v2/assets/img/content-app.png" alt = "" > </p>\
                                    <p> 扫描下载百强APP </p>\
                                </div>\
                            </div>\
                        </div>\
                    </li>\
                </ul>\
            </div >\
        ');
        $(appendPosi).addClass('reaPosi').after(contentDiv);

        chrome.extension.sendMessage({
            message: "来自content消息"
        }, function (response) {
            if (response) {
                return null
            } else {
                //alert(response)
                $('.content-price-all').remove();
                $('.content-li').css({
                    "width": "150px",
                    "background-position-x": "30px"
                });

                $('.content-li:last-child').css({"width" :"152px","border-right" :"none"})

            }
        });




        
    },

    appendPriceLine: function (brandUrl) {   //价格曲线
        var _this = this;

        $.ajax({
            type: "GET",
            url: apiUrl + "api/contentPage/getProductPriceLine?url=" + brandUrl,
            dataType: "json",
        }).done(function (res) {
            if(res.code == 100){
                var priceInfo = $('\
                    <div class="price-info">\
                        <h3>\
                            <span>当前价格:<em>' + res.data.priceLine.current + '元</em></span>\
                            <span>历史最高:<em>' + res.data.priceLine.historyHighest  + '元</em></span>\
                            <span>历史最低:<em>' + res.data.priceLine.historyLowest + '元</em></span>\
                        </h3>\
                        <div id="echart-line"></div>\
                    </div>\
                ');
    
                $('.price-line').append(priceInfo);
    
                
                //echart图表数据格式转换
                var days=res.data.priceLine.days;
                var echartDays =[],
                    echartPrice=[];
                for (var i = 0; i < days.length;i++ ){
                    echartDays.push(days[i].day);
                    echartPrice.push(days[i].price);
                }
                //调用echart传入格式化数组
                _this.echarts(echartDays,echartPrice);
            }else{
                return false
            }
        })

    },

    appendAllPricce:function(brandUrl){         //全网比价
        $.ajax({
            type: "GET",
            url: apiUrl + "api/contentPage/getAllMallPricce?url=" + brandUrl,
            dataType: "json",
        }).done(function (res) {
            if(res.code == 100){
                if(res.data.mallPrices !== null ){
                    var list= '';
                    for (var i = 0; i< res.data.mallPrices.length;i++){
                        //alert(res.data.mallPrices[i].name)
                        list += '<li><div class="logo-wrapper"><img src="' + res.data.mallPrices[i].logo + '" alt=""></div><span> 最新报价: <em> ￥' + res.data.mallPrices[i].price + '</em></span><a href = "' + res.data.mallPrices[i].url + '"target = "_blank" >直达链接 </a></li >';
                    }
                    var ulContent= '<ul>'+ list +'</ul>';
                    $('.price-all').append(ulContent);
                }else{
                    console.log('暂无全网比价信息')
                }
            }else{
                return false
            }
        })
    },


    appendEvaluateInfo:function(brandUrl){  //好评率
        var _this =this;
        $.ajax({
            type: "GET",
            url: apiUrl + "api/contentPage/getProductEvaluateInfo?url=" + brandUrl,
            //url: "http://127.0.0.1:3000/contentPage/getProductEvaluateInfo",
            dataType: "json",
        }).done(function (res) {
            //alert(res.data.evaluateInfo.goodRate)
            if(res.code == 100){
                if (res.data.evaluateInfo !== null){    
                   

                    var evaluateInfo = $('\
                        <div class="evaluate-info">\
                            <div class="evaluate-percent">\
                                <div class="evaluate-percent-all">\
                                    <p class="percent-all-good"><b><em>'+ res.data.evaluateInfo.goodRate + '<i>%</i></em></b></p>\
                                    <p class="percent-all-num"><em>全部评论:<span title="'+ res.data.evaluateInfo.sum + '条">'+ res.data.evaluateInfo.sum + '条</span></em></p>\
                                </div>\
                                <div class="evaluate-percent-kind">\
                                    <p>好评 <span><b></b></span> <em>' + res.data.evaluateInfo.goodRate + '%</em></p>\
                                    <p>中评 <span><b></b></span> <em>'+ res.data.evaluateInfo.badRate + '%</em></p>\
                                    <p>差评 <span><b></b></span> <em>'+ res.data.evaluateInfo.normalRate + '%</em></p>\
                                </div>\
                            </div>\
                            <div class="evaluate-tag">\
                            </div>\
                        </div>\
                    ');

                    $('.evaluate-wrapper').append(evaluateInfo);




                    $('.evaluate-percent-kind p').each(function () {
                        var oPercent = $(this).find('em').text();
                        $(this).find('b').css('width', oPercent)
                    })


                    insertTag();
                    function insertTag() {
                        var tagList = '';
                        for (var i = 0; i < res.data.evaluateInfo.tags.length; i++) {
                            //alert(res.data.evaluateInfo.tags[i].tag)
                            tagList += '<span title="' + res.data.evaluateInfo.tags[i].tag + '(' + res.data.evaluateInfo.tags[i].num + ')"><em>' + res.data.evaluateInfo.tags[i].tag + '(' + res.data.evaluateInfo.tags[i].num + ')</em></span>'


                        }
                        $('.evaluate-tag').append(tagList)
                    }                    
                    

                }else{
                    console.log('暂无好评信息')
                }



            }else{
                return false
            }
            
        });


    },
    
    appendBrandInfo:function(name,brandName,brandUrl){  //品牌信息

        $.ajax({
            type: "GET",
            url: apiUrl + "api/contentPage/getBrandInfo?name=" + name + "&brandName=" + brandName + "&url=" + brandUrl,
            dataType: "json",
        }).done(function (res) {
            //console.log(res.data);
            
            if(res.code == 100){     //接口
                if(res.data.brandInfo !== null){
                    
                    for( i in res.data.brandInfo){
                        if(!res.data.brandInfo [i]){
                            res.data.brandInfo[i] = "--"
                        }
                    };
                    
                    var brandDetail = $('\
                            <div class="brand-detail">\
                                <p><span>品牌名称: <em title="'+ res.data.brandInfo.name + '">'+ res.data.brandInfo.name + '</em></span> <span>综合评分:<em title="' + res.data.brandInfo.score +'">' + res.data.brandInfo.score +'分</em></span></p>\
                                <p><span>品牌年龄: <em title="'+ res.data.brandInfo.age + '岁">'+ res.data.brandInfo.age + '岁</em></span> <span>品牌热度:<em title="'+res.data.brandInfo.hot +'">' + res.data.brandInfo.hot +'</em></span></p>\
                                <p><span>全网销量: <em title="'+ res.data.brandInfo.sold +'">'+ res.data.brandInfo.sold +'</em></span> </p>\
                                <p><span>品牌折扣: <em title="'+ res.data.brandInfo.discount +'条">'+ res.data.brandInfo.discount +'条</em></span>  <a href="'+ res.data.brandInfo.url +'" target="_blank">查看更多>></a></p>\
                            </div>\
                    ');
                    $('.brand-info').append(brandDetail);

                }else{
                    console.log('暂无品牌信息')
                }
                


            }else{
                return false
            }
        })
        

    },
    
    echarts: function (echartDays, echartPrice) {
        var echartTheme = {
            "color": ["#3fb1e3","#6be6c1","#626c91","#a0a7e6","#c4ebad","#96dee8"],
            "backgroundColor": "rgba(252,252,252,0)",
            "textStyle": {},
            "title": {
                "textStyle": {
                    "color": "#666666"
                },
                "subtextStyle": {
                    "color": "#999999"
                }
            },
            "categoryAxis": {
                "axisLine": {
                    "show": true,
                    "lineStyle": {
                        "color": "#cccccc"
                    }
                },
                "axisTick": {
                    "show": false,
                    "lineStyle": {
                        "color": "#333"
                    }
                },
                "axisLabel": {
                    "show": true,
                    "textStyle": {
                        "color": "#999999"
                    }
                },
                "splitLine": {
                    "show": true,
                    "lineStyle": {
                        "color": [
                            "#eeeeee"
                        ]
                    }
                },
                "splitArea": {
                    "show": false,
                    "areaStyle": {
                        "color": [
                            "rgba(250,250,250,0.05)",
                            "rgba(200,200,200,0.02)"
                        ]
                    }
                }
            },
            "valueAxis": {
                "axisLine": {
                    "show": true,
                    "lineStyle": {
                        "color": "#cccccc"
                    }
                },
                "axisTick": {
                    "show": false,
                    "lineStyle": {
                        "color": "#333"
                    }
                },
                "axisLabel": {
                    "show": true,
                    "textStyle": {
                        "color": "#999999"
                    }
                },
                "splitLine": {
                    "show": true,
                    "lineStyle": {
                        "color": [
                            "#eeeeee"
                        ]
                    }
                },
                "splitArea": {
                    "show": false,
                    "areaStyle": {
                        "color": [
                            "rgba(250,250,250,0.05)",
                            "rgba(200,200,200,0.02)"
                        ]
                    }
                }
            }
        };
        echarts.registerTheme('walden', echartTheme)

        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('echart-line'), 'walden');

        // 指定图表的配置项和数据
        option = {
            xAxis: {
                type: 'category',
                data: echartDays
            },
            yAxis: {
                type: 'value'
            },
            tooltip:{

            },
            series: [{
                data: echartPrice,
                type: 'line'
            }]
        };

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option);
    },
    
    
    tabToggle: function (tabEle, tabList) {   //标签切换效果
        $(tabEle).on('mouseover', function (event) {
            $(this).addClass('active').siblings().removeClass('active');
            $(this).children('.div-list').show();
            $(this).siblings().children('.div-list').hide();
        });
        $(tabEle).on('mouseout',function(){
            $(this).children('.div-list').hide();
            $('.content-li').removeClass('active');
        })
    }
    
}

content.init();
