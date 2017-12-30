/*
version：v3.0
update:2017-12-30
*/
(function(wd){
	var doc=document;
	var tap='ontouchstart' in wd?'touchstart':'click';
	var touchstart='ontouchstart' in wd?'touchstart':'mousedown';
	var touchmove='ontouchmove' in wd?'touchmove':'mousemove';
	var touchend='ontouchend' in wd?'touchend':'mouseup';
	var requestAnimationFrame = wd.requestAnimationFrame || wd.webkitRequestAnimationFrame;
	var cancelAnimationFrame = wd.cancelAnimationFrame || wd.webkitCancelAnimationFrame;
	var transform='transform' in doc.createElement('div').style?'transform':'webkitTransform';
	wd.mCalendar=function(options){
		var this_=this;
		this_.init(options);	
	};
	wd.mCalendar.prototype.byClass=function(parentEl,className){
		return parentEl.getElementsByClassName(className);
	};
	wd.mCalendar.prototype.byTag=function(parentEl,tagName){
		return parentEl.getElementsByTagName(tagName);
	};
	wd.mCalendar.prototype.htmlStrJson={
		'header':'<div class="mCalendar-countbox">'+
					'<span class="mCalendar-l-arrow">&lt;</span>'+
					'<span class="mCalendar-count-number">2000年</span>'+
					'<span class="mCalendar-r-arrow">&gt;</span>'+
				'</div>'+
				'<div class="mCalendar-countbox">'+
					'<span class="mCalendar-l-arrow">&lt;</span>'+
					'<span class="mCalendar-count-number">00月</span>'+
					'<span class="mCalendar-r-arrow">&gt;</span>'+
				'</div>'+
				'<div class="mCalendar-btn-item">'+
					'<span class="mCalendar-btn mCalendar-cancel-btn">取消</span>'+
					'<span class="mCalendar-btn mCalendar-confirm-btn">完成</span>'+
				'</div>',
		'dayHeader':'<thead>'+'<tr>'+
						'<th>日</th>'+
						'<th>一</th>'+
						'<th>二</th>'+
						'<th>三</th>'+
						'<th>四</th>'+
						'<th>五</th>'+
						'<th>六</th>'+
					'</tr>'+'</thead>'
	};
	//options:appendToEl,className
	wd.mCalendar.prototype.createElement=function(tagName,options){
		var newEl=document.createElement(tagName);
		if(options.className){
			this.addClass(newEl,options.className);
		};
		options.appendToEl.appendChild(newEl);
		return newEl;
	};
	wd.mCalendar.prototype.hasClass=function(el,className){
	    var className=className||'';
	    if(className.replace(/\s/g, '').length==0){return false;};
	    return new RegExp(' '+className+' ').test(' '+el.className+' ');
	};
	wd.mCalendar.prototype.addClass=function(el,className){
	    if(!wd.mCalendar.prototype.hasClass(el,className)){
	        el.className+=' '+className;
	    }
	};
	wd.mCalendar.prototype.removeClass=function(el,className){
	    if(wd.mCalendar.prototype.hasClass(el,className)){
	        var newClass=' '+el.className.replace(/[\t\r\n]/g,'')+' ';
	        while(newClass.indexOf(' '+className+' ')>= 0){
	            newClass=newClass.replace(' '+className+' ',' ');
	        }
	        el.className=newClass.replace(/^\s+|\s+$/g,'');
	    }
	};
	wd.mCalendar.prototype.close=function(){
		var this_= this;
		this_.addClass(this_.calendar,'mCalendar-hide');
	};
	wd.mCalendar.prototype.open=function(){
		var this_=this;
		this_.removeClass(this_.calendar,'mCalendar-hide');
        //更新状态
        this_.update();
	};
	wd.mCalendar.prototype.dates=[];
	wd.mCalendar.prototype.months=[];
	wd.mCalendar.prototype.Date=new Date();

	//布局
	wd.mCalendar.prototype.tablelength=3;
	wd.mCalendar.prototype.rows=6;
	wd.mCalendar.prototype.cols=7;
	wd.mCalendar.prototype.tdslengh=42;
	wd.mCalendar.prototype.layout=function(){
		var calendar=this.createElement('div',{
			'appendToEl':document.body,
			'className':'mCalendar'
		});
		var mask=this.createElement('div',{
			'appendToEl':calendar,
			'className':'mCalendar-mask'
		});
		var container=this.createElement('div',{
			'appendToEl':calendar,
			'className':'mCalendar-container'
		});
		var header=this.createElement('div',{
			'appendToEl':container,
			'className':'mCalendar-header'
		});
		var body=this.createElement('div',{
			'appendToEl':container,
			'className':'mCalendar-body'
		});
		var weekbox=this.createElement('div',{
			'appendToEl':body,
			'className':'mCalendar-week-header'
		});
		var weekHeader=this.createElement('table',{
			'appendToEl':weekbox
		});
		var dategroup=this.createElement('div',{
			'appendToEl':body,
			'className':'mCalendar-date-group'
		});
		header.innerHTML=this.htmlStrJson.header;
		weekHeader.innerHTML=this.htmlStrJson.dayHeader;

		this.calendar=calendar;
		this.dategroup=dategroup;
		this.addClass(this.calendar,'mCalendar-hide');
		//创建日历表
		var width=this.width=this.calendar.offsetWidth;
		for(var i=0;i<this.tablelength;i++){
			var daysItem=this.createElement('table',{
				'appendToEl':dategroup
			});
			var tbody=this.createElement('tbody',{
				'appendToEl':daysItem
			});
			for(var r=0;r<this.rows;r++){
				var tr=this.createElement('tr',{
					'appendToEl':tbody
				});
				for(var c=0;c<this.cols;c++){
					var td=this.createElement('td',{
						'appendToEl':tr
					});
				};
			};
			this.translateX(daysItem,-100+100*i);
		};
	};
	//切换日期: 参数dir 左右方向值 左：1 右：-1  switchType：切换年或月
	wd.mCalendar.prototype.switchDate=function(dir,switchType,duration){
		var duration=duration+1||250;
		var this_=this;
		if(Date.now()-this_.handlerStart<duration){
			return;
		};
		this_.endX+=this_.width*dir;
		this_.currentDate[switchType]+=dir*-1;
		if(this_.currentDate.month<0){
			this_.currentDate.year-=1;
			this_.currentDate.month=11;
		}else if(this_.currentDate.month>11){
			this_.currentDate.year+=1;
			this_.currentDate.month=0;
		};
		this_.currentIndex+=dir*-1;
		if(this_.currentIndex>this_.tablelength-1){
			this_.currentIndex=0;
		} else if(this_.currentIndex<0){
			this_.currentIndex=this_.tablelength-1;
		};
		this_.tables[this_.preIndex].removeAttribute('aria-show');
		this_.tables[this_.currentIndex].setAttribute('aria-show','true');
		if(dir===-1){
			var nextIndex=this_.currentIndex+1>this_.tablelength-1?0:this_.currentIndex+1;
		}else if(dir===1){
			var nextIndex=this_.currentIndex-1<0?this_.tablelength-1:this_.currentIndex-1;
		};
		this_.translateX(this_.tables[this_.preIndex],(-this_.endX+this_.width*dir)/this_.width*100);
		this_.translateX(this_.tables[nextIndex],(-this_.endX+this_.width*dir*-1)/this_.width*100);
		this_.translateX(this_.tables[this_.currentIndex],(-this_.endX)/this_.width*100);
		if(switchType==='year'){
			this_.drawDate(this_.tables[this_.preIndex],this_.currentDate.year-dir*-1,this_.currentDate.month);
			this_.drawDate(this_.tables[nextIndex],this_.currentDate.year+dir*-1,this_.currentDate.month);
		}else if(switchType==='month'){
			this_.drawDate(this_.tables[this_.preIndex],this_.currentDate.year,this_.currentDate.month-dir*-1);
			this_.drawDate(this_.tables[nextIndex],this_.currentDate.year,this_.currentDate.month+dir*-1);
		};
		this_.drawDate(this_.tables[this_.currentIndex],this_.currentDate.year,this_.currentDate.month);
		this_.scrollX({
			'endX':this_.endX,
			'duration':duration,
			'callback':function(){
				this_.startX=this_.endX;
			}
		});
		this_.update();
		this_.preIndex=this_.currentIndex;
		this_.handlerStart=Date.now();
	};

	wd.mCalendar.prototype.select=function(){
		var this_=this;
		this_.bindselect=function(){
			var e=arguments[0];
			var thisEle=e.target.parentElement;
			if(thisEle&&thisEle.nodeName.toLowerCase()=='td'&&this_.hasClass(thisEle,'activeDay')){
                var date = thisEle.getAttribute('aria-date');
				if(this_.hasClass(thisEle,'active')){
                    this_.removeClass(thisEle,'active');
                    delete this_.selectedDates[date];
                }else{
                    if(!this_.multiple){
                        for(var i=0;i<this.tdsAllLen;i++){
                            this_.removeClass(this_.alltds[i],'active');
                        };
                        this_.selectedDates = {};
                    }
                    this_.selectedDates[date] = date;
                    this_.addClass(thisEle,'active');
                };
			};
		};
	};
	wd.mCalendar.prototype.translateX=function(el,x){
		el.style[transform]="translate3d("+x+"%,0,0)";
	};

	wd.mCalendar.prototype.scrollX=function(options){
		var this_=this;
		requestAnimationFrame?cancelAnimationFrame(this_.timer):clearTimeout(this_.timer);
		var moveX=0,
		startX=this_.startX,
		endX=options.endX,
		duration=options.duration||250,
		stepTime=0,
		startTime=Date.now();
		function ani(){
			if(stepTime/duration>=1){
				requestAnimationFrame?cancelAnimationFrame(this_.timer):clearTimeout(this_.timer);
				this_.timer=null;
				if(options.callback){
					(options.callback)();
				};
				return;
			};
			stepTime=Math.min(duration,(Date.now()-startTime));
			moveX=startX+(endX-startX)/duration*stepTime;
			this_.startX=moveX;
			this_.translateX(this_.dategroup,moveX/this_.width*100);
			this_.timer=requestAnimationFrame?requestAnimationFrame(ani):setTimeout(ani,0);
		};
		ani();
	};

	wd.mCalendar.prototype.swipeX=function(){
		var this_=this;
		var touchstartX=touchmoveX=moveendX=gapX=0;
		var dir=0;
		function move(){
			var touch=arguments[0].touches?arguments[0].touches[0]:arguments[0];
	        touchmoveX=touch.pageX;
	        gapX=touchmoveX-touchstartX;
	        if(touchmoveX>moveendX){
	        	//swipe-right
				dir=1;	
	        }else{
	        	//swipe-left
	        	dir=-1;
	        };
	        moveendX&&(this_.startX+=(touchmoveX-moveendX));
	        this_.translateX(this_.dategroup,this_.startX/this_.width*100);
	        moveendX=touch.pageX;
	        arguments[0].preventDefault();
		};
		this_.dategroup.addEventListener(touchstart,function(){
	        var touch=arguments[0].touches?arguments[0].touches[0]:arguments[0];
	        touchstartX=touch.pageX;
	        this_.calendar.addEventListener(touchmove,move,false);
	        arguments[0].preventDefault();       
		},false);
		this_.calendar.addEventListener(touchend,function(){
			if(Math.abs(gapX)>10){
				this_.switchDate(dir,'month');
	    	}else{
	    		if(Math.abs(gapX)==0){
		    		this_.bindselect(arguments[0]);
		    	};
		    	if(Math.abs(gapX)>0&&!this_.hasClass(arguments[0].target,'mCalendar-l-arrow')&&!this_.hasClass(arguments[0].target,'mCalendar-r-arrow')){
		    		this_.scrollX({
		    			'endX':this_.endX,
		    			'duration':200,
		    			'callback':function(){
		    				this_.startX=this_.endX;
		    			}
		    		});
		    	};
	    	};
	        this_.calendar.removeEventListener(touchmove,move);
	        touchstartX=touchmoveX=moveendX=gapX=0;
		});
	};

	wd.mCalendar.prototype.drawDate=function(el,year,month){
		//绘制
		var tbody=this.byTag(el,'tbody')[0];
		var year=year;
		var month=month;
		if(month<0){
			year-=1;
			month=11;
		}else if(month>11){
			year+=1;
			month=0;
		};
		var startDate=1;//当月第一天日期
		var endDate=new Date(year,month+1,0).getDate();//当月最后一天日期
		var firstDay=new Date(year,month,1).getDay();//当月第一天是周几
		var preDate=new Date(year,month,0).getDate()-firstDay+1;//上个月补全开始日期
		var nextDate=1;//下个月补全开始日期

		var innerstr="";
		var tdstrs=[];
		for(var i=0;i<this.tdslengh;i++){
			if(i<firstDay){
				tdstrs.push(
							"<td class='mendDay' aria-date="+(month-1<0?year-1:year)+"-"+this.months[month-1<0?11:month-1]+"-"+this.dates[preDate-1]+">"+
								"<div>"+preDate+"</div>"+
							"</td>"
						);
				preDate++;
			}else if(startDate>endDate){
				tdstrs.push(
							"<td class='mendDay' aria-date="+(month+1>11?year+1:year)+"-"+this.months[month+1>11?0:month+1]+"-"+this.dates[nextDate-1]+">"+
								"<div>"+nextDate+"</div>"+
							"</td>"
						);
				nextDate++;
			}else{
				tdstrs.push(
							"<td class='activeDay' aria-date="+year+"-"+this.months[month]+"-"+this.dates[startDate-1]+">"+
								"<div>"+startDate+"</div>"+
							"</td>"
						);
				startDate++;
			};
		};
		for(var r=0;r<this.rows;r++){
			var coltds="";
			for(var d=r*this.cols;d<r*this.cols+this.cols;d++){
				coltds+=tdstrs[d];
			};
			innerstr+="<tr>"+coltds+"</tr>";
		};
		tbody.innerHTML=innerstr;
	};
	wd.mCalendar.prototype.update=function(){
        var this_ = this;
		this_.yearNum.innerHTML=this_.currentDate.year+'年';
		this_.monthNum.innerHTML=String(this_.currentDate.month+1).length==1?'0'+(this_.currentDate.month+1)+'月':this_.currentDate.month+1+'月';
        var date_els = this_.byClass(this_.calendar,'activeDay');
        var len = date_els.length;
        //清空状态
        Array.prototype.forEach.call(date_els,function(item){
            this_.removeClass(item,'active');
        });
        //更新状态
		for(var t=0;t<len;t++){
			for(var s in this_.selectedDates){
				if(date_els[t].getAttribute('aria-date')==this_.selectedDates[s]){
					this_.addClass(date_els[t],'active');
				};
			};
		};
	};
	wd.mCalendar.prototype.init=function(options){
		var this_=this;
        this_.handlerStart=Date.now();
        this_.currentIndex=this_.preIndex=1;
        this_.startX=0;
        this_.endX=0;
        this_.layout();
        this_.countbox=this_.byClass(this_.calendar,'mCalendar-countbox');
        this_.tables=this_.byTag(this_.dategroup,'table');
        this_.yeararrow_l=this_.byClass(this_.countbox[0],'mCalendar-l-arrow')[0];
        this_.yeararrow_r=this_.byClass(this_.countbox[0],'mCalendar-r-arrow')[0];
        this_.datearrow_l=this_.byClass(this_.countbox[1],'mCalendar-l-arrow')[0];
        this_.datearrow_r=this_.byClass(this_.countbox[1],'mCalendar-r-arrow')[0];
        this_.yearNum=this_.byClass(this_.calendar,'mCalendar-count-number')[0];
        this_.monthNum=this_.byClass(this_.calendar,'mCalendar-count-number')[1];
        this_.cancelBtn=this_.byClass(this_.calendar,'mCalendar-cancel-btn')[0];
        this_.confirmBtn=this_.byClass(this_.calendar,'mCalendar-confirm-btn')[0];
        this_.selectedDates = {};
        this_.outputDate=[];

        if(options){
            //如果设置初始化日期 否则初始化日期为当天
            if(options.initDate){
                var date_str = options.initDate.split(',')[0];//如果是多选初始日期 则取第一个
                var year=date_str.substr(0,4),
                month=parseInt(date_str.substr(5,2))-1,
                date=date_str.substr(8,2);
                month=month<10?'0'+month:month;
                this_.Date=new Date(year,month,date);
                this_.currentDate={
                    'day':this_.Date.getDay(),
                    'date':this_.Date.getDate(),
                    'month':this_.Date.getMonth(),
                    'year':this_.Date.getFullYear()
                };
            }else{
                this_.Date=new Date();
                this_.currentDate={
                    'day':this_.Date.getDay(),
                    'date':this_.Date.getDate(),
                    'month':this_.Date.getMonth(),
                    'year':this_.Date.getFullYear()
                };
            };
            if(options.toBind){
                options.toBind.addEventListener(touchstart,function(){
                    try{
                        this_.selectedDates = {};
                        var update_date_arr = this_.outputDate.length?this_.outputDate.split(','):options.initDate.split(',');
                        update_date_arr.forEach(function(item,index){
                            this_.selectedDates[item] = item;
                        });
                        if(!this_.multiple){
                            this_.selectedDates = {};
                            this_.selectedDates[update_date_arr[0]] = update_date_arr[0];
                        }
                    }catch(error){
                        this_.selectedDates = {};
                    }
                    this_.open();
                    arguments[0].preventDefault();
                });
            };
            if(options.multiple){
                this_.multiple=true;
            };
            if(options.callback&&typeof(options.callback)=="function"){
                this_.hasCallback=true;
                this_.callback=options.callback;
            };
            if(options.inited){
                options.inited();
            }
        }else{
            return;
        };

		for(var i=1;i<=31;i++){
			if(i<10){
				i='0'+i;
			};
			i=String(i);
			wd.mCalendar.prototype.dates.push(i);
		};
		for(var i=1;i<=12;i++){
			if(i<10){
				i='0'+i;
			};
			i=String(i);
			wd.mCalendar.prototype.months.push(i);
		};
		

		this_.translateX(this_.dategroup,this_.startX);
		this_.swipeX();
		this_.dategroup.style.height=this_.byTag(this_.dategroup,'tbody')[0].offsetHeight+"px";

        this_.alltds=this_.byTag(this_.calendar,'td');
        this_.tdsAllLen=this_.alltds.length;
		for(var i=0;i<this_.tablelength;i++){
			this_.drawDate(this_.tables[i],this_.currentDate.year,this_.currentDate.month-1+i);
		};
		this_.tables[1].setAttribute('aria-show','true');
		this_.update();

		//切换月份
		this_.datearrow_l.addEventListener(tap,function(){
			this_.switchDate(1,'month',0);
		},false);
		this_.datearrow_r.addEventListener(tap,function(){
			this_.switchDate(-1,'month',0);	
		},false);
		//切换年份
		this_.yeararrow_l.addEventListener(tap,function(){
			this_.switchDate(1,'year',0);
		},false);
		this_.yeararrow_r.addEventListener(tap,function(){
			this_.switchDate(-1,'year',0);
		},false);

		this_.select();

		this_.cancelBtn.addEventListener('click',function(){
			this_.close();
		},false);
		this_.confirmBtn.addEventListener('click',function(){
			this_.close();
			this_.outputDate = [];
            delete options.initDate;
            for(var i in this_.selectedDates){
            	this_.outputDate.push(this_.selectedDates[i]);
            };
			this_.outputDate = this_.outputDate.sort().join();
			if(this_.hasCallback){
				(this_.callback)();
			};
		},false);
	};
})(window);