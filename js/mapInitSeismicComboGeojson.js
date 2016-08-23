/*function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}*/

var utigDownload = function(qurl){
    var myWindow = window.open(qurl,"_blank");
    window.focus();
    setTimeout(function() {
        var myWindow2 = window.open("http://www-udc.ig.utexas.edu/sdc/cart/checkout.php?action=view","_blank");
        myWindow.close();
        myWindow2.focus();
    } , 500);
};

var style = function(color) {
    return {
	strokeColor: color,
	strokeWeight: 2.3,
	icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 2,
            strokeColor: color,
            fillColor: color,
            fillOpacity:1.0
	}
    }
}

var style_hover = style('#ffffff');



$(document).ready(function() {
    mgdsMap = new MGDSMapClient();
    mgdsMap.mapdiv = 'mapc';
    mgdsMap.mapInit();
    mgdsMap.baseMap();

    var utigTemplateReq = $.get('template/utig_template.tmpl.html')
    var ldeoTemplateReq = $.get('template/mgds_template.tmpl.html')

    $.when(utigTemplateReq, ldeoTemplateReq).done(function(utigTmplData,ldeoTmplData) {
	var utigTemplate = $.templates(utigTmplData[0]);
	var ldeoTemplate = $.templates(ldeoTmplData[0]);
	var clickHandler = function(e) {
	    var ft = e.feature;
	    id = ft.getId();
	    if (id.match(/^utig/)) {
		var template = utigTemplate;
	    } else {
		var template = ldeoTemplate;
	    }
	    ft.toGeoJson(function(obj) {
            var content = template.render(obj);
            content = '<div class="ucontent">' + content + '</div>';
            mgdsMap.marker.setPosition(e.latLng);
            mgdsMap.marker.setMap(mgdsMap.map);
            mgdsMap.infowin.setContent(content);
            mgdsMap.infowin.open(mgdsMap.map,mgdsMap.marker);
	    });
	};

	function point2LatLng(point,map) {
	    var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
	    var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
	    var scale = Math.pow(2, map.getZoom());
	    var worldPoint = new google.maps.Point(point.x / scale + bottomLeft.x, point.y / scale + topRight.y);
	    return map.getProjection().fromPointToLatLng(worldPoint);
	}
	
	var hover_text_fun = function(opts) {
	    return function(e,lloverlay) {
		var ft = e.feature;
		var id = ft.getId();
		var names = {};
		if (id.match(/^utig/)) {
		    for (var obj of ft.getProperty('objects')) {
			names[obj.line_name] = true;
		    }
		} else if (id.match(/^ldeo/)) {
		    for (var obj of ft.getProperty('objects')) {
			for (var event of obj.events) {
			    names[event.event_name] = true;
			}
		    }
		}
		var text = "Seismic Line: " + Object.keys(names).join(',');
		var pixel = lloverlay.getProjection().fromLatLngToContainerPixel(e.latLng);
		pixel.x += 20; pixel.y += 20;
		var latlng = point2LatLng(pixel,mgdsMap.map);
		var obj = {
		    text: text,
		    position: latlng,
		};
		$.extend(obj, opts);
		return obj;
	    }
	}
	
	//var entry_id = getParameterByName('entry_id');
	var utig =  $('#mapc').hasClass('utig');
	var ldeo = $('#mapc').hasClass('ldeo');
	
	var params = (utig ? '&utig=1' : '') + (ldeo ? '&ldeo=1' : '') + (entry_id ? ('&entry_id=' + entry_id) : '');
	mgdsMap.GeoJSONOverlay({
	    url: 'http://www.marine-geo.org/services/geojson/mapview_seismic_json.php?layer=mcs_field' + params,
	    title: 'MCS Field',
	    onoff: true,
	    idProp: 'id',
	    defaultStyle: style('#000080'),
	    mouseoverStyle: style_hover,
	    click: clickHandler,
	    control_position: 0,
	    hover_text_fun: hover_text_fun({
		fontColor: '#000000',
	    })
	});
	mgdsMap.GeoJSONOverlay({
	    url: 'http://www.marine-geo.org/services/geojson/mapview_seismic_json.php?layer=mcs_processed' + params,
	    title: 'MCS Processed',
	    onoff: true,
	    idProp: 'id',
	    defaultStyle: style('#0000ff'),
	    mouseoverStyle: style_hover,
	    click: clickHandler,
	    control_position: 1,
	    hover_text_fun: hover_text_fun({
		fontColor: '#000000',
	    })
	});
	mgdsMap.GeoJSONOverlay({
	    url: 'http://www.marine-geo.org/services/geojson/mapview_seismic_json.php?layer=scs' + params,
	    title: 'SCS',
	    onoff: true,
	    idProp: 'id',
	    defaultStyle: style('#8B0000'),
	    mouseoverStyle: style_hover,
	    click: clickHandler,
	    control_position: 2,
	    hover_text_fun: hover_text_fun({
		fontColor: '#000000',
	    })
	});
	mgdsMap.GeoJSONOverlay({
	    url: 'http://www.marine-geo.org/services/geojson/mapview_seismic_json.php?layer=obs' + params,
	    title: 'OBS & Other Wide Angle',
	    onoff: true,
	    idProp: 'id',
	    defaultStyle: style('#f0e68c'),
	    mouseoverStyle: style_hover,
	    click: clickHandler,
	    control_position: 3,
	    hover_text_fun: hover_text_fun({
		fontColor: '#000000',
	    })
	});
	mgdsMap.GeoJSONOverlay({
	    url: 'http://www.marine-geo.org/services/geojson/mapview_seismic_json.php?layer=subbottom' + params,
	    title: 'Subbottom',
	    onoff: true,
	    idProp: 'id',
	    defaultStyle: style('#ff0000'),
	    mouseoverStyle: style_hover,
	    click: clickHandler,
	    control_position: 4,
	    hover_text_fun: hover_text_fun({
		fontColor: '#000000',
	    })
	});
    });
});
