var mgdsMap;
var activateGMap = function(){
};
var utigQueue = function(qurl,callback){
    var myWindow = window.open(qurl);
    window.focus();
    setTimeout(function() {
        myWindow.close();
        if (typeof callback === "function") {
            callback();
        }
    } , 500);
};
var utigDownload = function(qurl){
    utigQueue(qurl,function(){
        var myWindow2 = window.open("http://www-udc.ig.utexas.edu/sdc/cart/checkout.php?action=view");
        myWindow2.focus();
    });
};
$(document).ready(function(){
    mgdsMap = new MGDSMapClient();
	mgdsMap.mapdiv = 'mapc';
    mgdsMap.mapInit();
	mgdsMap.baseMap();

    var clickCallback = function(layers) {
	return function(qurl,data,latlon) {
	    var requests = [];
	    for (var i = 0; i < layers.length; i++) {
            data['LAYERS'] = layers[i];
            data['QUERY_LAYERS'] = layers[i];
            data['FEATURE_COUNT'] = 50;
            var str = decodeURIComponent($.param(data));
            requests.push($.ajax({
                type: "GET",
                url: qurl,
                data: str,
                beforeSend: function(msg){
                    mgdsMap.map.setOptions({
                        draggableCursor: 'wait'
                    });
                }
            }));
	    }
	    $.when.apply(undefined, requests).always(function(){
            mgdsMap.map.setOptions({
                draggableCursor: 'crosshair'
            });
        }).done(function() {
            var msgs = [];
            
            if (layers.length == 1) {
                msgs = [ arguments[0] ];
            } else {
                msgs = Array.prototype.slice.call(arguments).map(function(arg) { return arg[0]; });
            }
            if (msgs.some(function(msg) { return msg; })) {
                mgdsMap.marker.setPosition(latlon);
                mgdsMap.marker.setMap(mgdsMap.map);
                mgdsMap.infowin.setContent("");
                $.each(msgs,function(i,v){
                    console.log(v);
                    var data = $.parseHTML(v);
                    if (data && $(data).hasClass("mgds_json_content")) {
                        $.get('mgds_template.tmpl.html').done(function(tdata){
                            var template = $.templates(tdata);
                            var options = {
                                checkValue: function(arr,element,value){
                                    for (var i=0;i<arr.length;i++) {
                                        if (arr[i][element]==value) {
                                            return true;
                                        }
                                    }
                                    return false;
                                }
                            };
                            var obj = $(data).html();
                            if (obj) {
                                var existingContent = $(mgdsMap.infowin.getContent()).find(".ucontent").html();
                                if (typeof existingContent === "undefined")
                                    existingContent = '';
                                mgdsMap.infowin.setContent("<div class=\"ucontent\">"+existingContent+template.render(JSON.parse(obj),options)+"</div>");
                            }   
                        });
                        mgdsMap.infowin.open(mgdsMap.map,mgdsMap.marker);
                    } else if (data && $(data).hasClass("utig_json_content")) {
                        $.get('utig_template.tmpl.html').done(function(tdata){
                            var template = $.templates(tdata);
                            var options = {
                                checkValue: function(arr,element,value){
                                    for (var i=0;i<arr.length;i++) {
                                        if (arr[i][element]==value) {
                                            return true;
                                        }
                                    }
                                    return false;
                                }
                            };
                            var obj = $(data).html();
                            if (obj) {
                                var existingContent = $(mgdsMap.infowin.getContent()).find(".ucontent").html();
                                if (typeof existingContent === "undefined")
                                    existingContent = '';
                                mgdsMap.infowin.setContent("<div class=\"ucontent\">"+existingContent+template.render(JSON.parse(obj),options)+"</div>");
                            }   
                        });
                        mgdsMap.infowin.open(mgdsMap.map,mgdsMap.marker);
                    }
                });
            }
	    });
	};
    };
    
    var mapserver_base = "http://www.marine-geo.org/services/mapserv7/mgds_data?";
    var layers = [
        {
            "title" : "MCS Field",
            "sld_url" : "http://www.marine-geo.org/services/sld/mcs_slde.xml",
            "layers" : 'MGDS-DataSetsLines,UTIG-Lines',
            "query_layers" : ['MGDS-DataObjectsLines','UTIG-DataObjects']
        },
        /*{
            "title" : "MCS Field (Old)",
            "sld_url" : "http://www.marine-geo.org/services/sld/mcs_sld.xml",
            "layers" : 'MGDS-DataSets,UTIG-Lines',
            "query_layers" : ['MGDS-DataObjects','UTIG-DataObjects']
        },*/
        {
            "title" : "MCS Processed",
            "sld_url" : "http://www.marine-geo.org/services/sld/mcs_proc_sld.xml",
            "layers" : 'UTIG-Lines',
            "query_layers" : ['UTIG-DataObjects']
        },
        {
            "title" : "SCS",
            "sld_url" : "http://www.marine-geo.org/services/sld/scs_slde.xml",
            "layers" : 'MGDS-DataSetsLines,UTIG-Lines',
            "query_layers" : ['MGDS-DataObjectsLines','UTIG-DataObjects']
        },
        /*{
            "title" : "SCS (Old)",
            "sld_url" : "http://www.marine-geo.org/services/sld/scs_sld.xml",
            "layers" : 'MGDS-DataSets,UTIG-Lines',
            "query_layers" : ['MGDS-DataObjects','UTIG-DataObjects']
        },*/
        {
            "title" : "OBS & Other Wide Angle",
            "sld_url" : "http://www.marine-geo.org/services/sld/obs_slde.xml",
            "layers" : 'MGDS-DataObjects-OBS,MGDS-DataObjects-Points-OBS,MGDS-DataSets,MGDS-DataStations-OBS,MGDS-DataObjectsStations-Computed,MGDS-DataSets-Points,UTIG-Lines,UTIG-Points',
            "query_layers" : ['MGDS-DataObjects-OBS','MGDS-DataObjects-Points-OBS','MGDS-DataObjects','UTIG-DataObjects']
        },
        /*{
            "title" : "OBS & Other Wide Angle (Old)",
            "sld_url" : "http://www.marine-geo.org/services/sld/obs_sld.xml",
            "layers" : 'MGDS-DataSets,MGDS-DataSets-Points,UTIG-Lines,UTIG-Points',
            "query_layers" : ['MGDS-DataObjects','UTIG-DataObjects']
        },*/
        {
            "title" : "Subbottom",
            "sld_url" : "http://www.marine-geo.org/services/sld/chirps_sld.xml",
            "layers" : 'MGDS-DataSets,UTIG-Lines',
            "query_layers" : ['MGDS-DataObjects','UTIG-DataObjects']
        },
        /*{
            "title" : "Subbottom (Old)",
            "sld_url" : "http://www.marine-geo.org/services/sld/chirps_sld.xml",
            "layers" : 'MGDS-DataSets,UTIG-Lines',
            "query_layers" : ['MGDS-DataObjects','UTIG-DataObjects']
        }*/
    ];
    
    layers.forEach(function(layer,idx){
        mgdsMap.overlayWMS(
            mapserver_base+$.param({"SLD":layer['sld_url']})+"&",
            layer['layers'],
            layer['title'],
            'image/png',
            {
                SERVICE     : "WMS",
                REQUEST     : "GetFeatureInfo",
                SRS         : "EPSG:4326",
                WIDTH       : 4,
                HEIGHT      : 4,
                X           : 2,
                Y           : 2,
                VERSION     : "1.0.0",
                INFO_FORMAT : "text/html",
                SLD         : layer['sld_url'],
                qurl        : "/services/mapserv7/mgds_data?"
            },
            null,
            null,
            clickCallback( layer['query_layers'] )
        );
    });

    mgdsMap.overlayControl();
    
});
