// ------------------------------------------------------------------------
// jxSlider 0.3 by Nagy Gergely Alias CHP
// Minden adattag lehet funkció amely visszatérési értéke a megfelelő adat
// Pl.: url lehet "" vagy function(){ return ""; }
// Az összes adattag hozzá van kapcsolva az objektumhoz tehát működik a 
// $(this) használata.
// ------------------------------------------------------------------------
// url: "",             	// ajax url
// type: 'GET',         	// ajax type
// data: {},            	// ajaxhoz hozzá tenedő plusz adatok
// argument: "page",    	// a lapozó paramétere Pl.: ?page=*
// argumentType: 'GET', 	// a paraméter típusa
// async: true,         	// bambambaaaaam
// multicall: false,         	// az előző ajax törlésre kerül ha next vagy prev van azaz hiába sync vagy nem az előző kéréseket leállítja
// pages: [],           	// lapok lehet [1,2,3,4] vagy [1,57,83,32] vagy ["alma","korte",2,53]
// next: ".next",       	// lapozó következő gomb
// prev: ".prev",       	// na vajon ez mi?
// prevclick: function(){}	// amikor megnyomódott a prev gomb. return true; alapértelmezett ként.
// nextclick: function(){}	// amikor megnyomódott a next gomb. return true; alapértelmezett ként.
// dataType: 'HTML',    	// vissza térési értékek típusa
// hoverPause: true,    	// felé állva lapozzon-e avagy sem?!.
// repeat: true,        	// ismételje vagy sem.
// random: true,        	// véletlen generálás a listából.
// interval: 5000,      	// másodpercben a várakozás alap: 5mp
// end: function(){},   	// ha betöltötte a tartalmat mi történjen a tartalommal
// start: function(){}, 	// ha elkezte az ajax-ot mi történjen
// error: function(){}  	// ha hiba volt az ajax-ban akkor ez megy végbe...
// ------------------------------------------------------------------------
(function($) {
	$.fn.jxSlider = function(opts){
		var defaults = {
                url: "",
                type: 'GET',
                data: {},
                argument: "arg",
                argumentType: 'GET',
                async: true,
                multicall: false,
                pages: [],
                random: false,
                next: ".next",
                prev: ".prev",
                prevclick: function(){ return true; },
                nextclick: function(){ return true; },
                dataType: 'HTML',
                hoverPause: true,
                repeat: true,
                interval: 5000,
                end: function(){},
                start: function(){},
                error: function(){}
		};
		var options = $.extend({},defaults,opts);
                function isFunction(functionToCheck) {
				 var getType = {};
				 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
			}
                function isString(data){
                    return typeof data === 'string';
                }
		return $(this).each(function(si,elem){
			var $this = $(elem);
			var slider_xhr;
                        var pages = isFunction(options.pages) ? options.pages.apply($this,[]) : options.pages;
                        var page = 0, last_page = 9999;
                        $this.data('jxSliderStop',false);
                        var ajax = function(way,random){
                            var fdata = isFunction(options.data) ? options.data.apply($this,[]) : options.data;
                            var temp = [];
                            var argument = isFunction(options.argument) ? options.argument.apply($this,[]) : options.argument;
                            temp[argument] = pages[page];
                            var _url = isFunction(options.url) ? options.url.apply($this,[]) : options.url;
                            var _type = isFunction(options.type) ? options.type.apply($this,[]) : options.type;
                            if(options.argumentType == options.type)
                            {
                            	fdata = $.extend({},fdata,temp);
                            }
                            else if(options.argumentType == 'GET')
                        	{
                            	_url =  _url.match(/\?/) ? _url : _url + '?';

                                for ( var key in temp ) {
                                    var re = RegExp( ';?' + key + '=?[^&;]*', 'g' );
                                    _url = _url.replace( re, '');
                                    _url += ';' + key + '=' + temp[key]; 
                                }  
                                // cleanup url 
                                _url = _url.replace(/[;&]$/, '');
                                _url = _url.replace(/\?[;&]/, '?'); 
                                _url = _url.replace(/[;&]{2}/g, ';');
                        	}
                            else if(options.argumentType == 'POST')
                            {
                            	fdata = $.extend({},fdata,temp);
                            	_type = 'POST';
                            }
                            if(last_page != page)
                            {
	                            if(!options.multicall) if(typeof(slider_xhr) !== 'undefined') slider_xhr.abort();
	                            slider_xhr = $.ajax({
	                                type: _type,
	                                async: isFunction(options.async) ? options.async.apply($this,[]) : options.async,
	                                dataType: isFunction(options.dataType) ? options.dataType.apply($this,[]) : options.dataType,
	                                url: _url,
	                                data: fdata,
	                                beforeSend: function(data){
	                                    options.start.apply($this,[data]);
	                                },
	                                success: function(data){
	                                	last_page = page;
	                                	if(typeof(random) == 'undefined' || (typeof(random) != 'undefined' && random === false) )
	                                	{
	                                        if(way == 'next')
	                                            page = page + 1;
	                                        else if(way == 'prev')
	                                            page = page - 1;
	                                        if(page > pages.length-1)
	                                            page = 0;
	                                        if(page < 0)
	                                            page = pages.length-1;
	                                	}
	                                	else
	                            		{
	                                		function randomFromInterval(from,to)
	                                		{
	                                		    return Math.floor(Math.random()*(to-from+1)+from);
	                                		}
	                                		page = randomFromInterval(0,pages.length-1);
	                            		}
	                                    options.end.apply($this,[data]);
	                                },
	                                error: function(){
	                                	last_page = page;
	                                },
	                                complete: function(){
	                                    options.error.apply($this,[]);
	                                }
	                            });
                            }
                        };
                        $this.data('jxSliderAjax',ajax);
                        if(options.interval > 0)
                        {
		                    var timer = setInterval(function(){
		                        jump('next');
		                    },options.interval);
		                    $this.data('jxSliderTimer',timer);
                        }
                        var jump = function(way,force){
                            var ajax = $this.data('jxSliderAjax');
                            if(
                                    options.hoverPause && 
                                        (
                                            $this.data('jxSliderStop') !== true ||
                                            ( typeof force != 'undefined' && force === true )
                                        )
                                )
                            	{
	                            	if( typeof force != 'undefined' && force === true )
	                        		{
	                            		ajax(way);
	                        		}
	                            	else
	                        		{
	                            		ajax(way,options.random);
	                        		}
                            	}
                            if(!options.repeat && page == pages.length-1 && options.random === false)
                                clearInterval(timer);  
                        };
                        jump('next');
                        $this.on({
                            mouseenter: function(){
                                $this.data('jxSliderStop',true); 
                            },
                            mouseleave: function(){
                                $this.data('jxSliderStop',false);
                            }
                        });

                        if(isFunction(options.next)) options.next = $(options.next.apply($this,[]));
                        if(isString(options.next)) options.next = $(options.next,$this);
                        
                        if(isFunction(options.prev)) options.prev = $(options.prev.apply($this,[]));
                        if(isString(options.prev)) options.prev = $(options.prev,$this);
			
                        $this.on('click' , options.next.selector , function(){
                            jump('next',true);
                            if(isFunction(options.nextclick))
                            	return options.nextclick();
                        });
                        $this.on('click', options.prev.selector , function(){
                            jump('prev',true);
                            if(isFunction(options.prevclick))
                            	return options.prevclick();
                        });
                });
        };
})(jQuery);