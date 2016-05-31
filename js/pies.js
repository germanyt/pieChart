
;(function($){

    var defaultOptions = {
        ringLineWidth: 13,
        fillColor: 'rgb(240,239,239)',
        highLightLineWidth: 10,
        highLightColor: '#80c5ff',
        highLightSecondColor: '#4596fa',

        textHtml: false,
        textFontSize: 26,
        textColor: '#4596fa',

        title: '',
        titleFontSize: 13,
        titleColor: '#323232',

        fixed: true,
        transition: 'ease'

    };

    var rootFontSize = parseFloat( document.documentElement.style.fontSize );
    var basicFontSize = 16;

    var fontSizeRatio = rootFontSize / basicFontSize;



    var requestAnimFrame = (function(){
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(callback) {
                return window.setTimeout(callback, 1000 / 60);
            };
    })();
    var cancelAnimFrame = (function(){
        return window.cancelAnimationFrame ||
            window.webkitCancelAnimationFrame ||
            window.mozCancelAnimationFrame ||
            window.oCancelAnimationFrame ||
            window.msCancelAnimationFrame ||
            function(callback) {
                return window.clearTimeout(callback, 1000 / 60);
            };
    })();

    var retinaScale = function(chart){
        var ctx = chart,
            width = chart.canvas.width,
            height = chart.canvas.height;

        if (window.devicePixelRatio) {
            ctx.canvas.style.width = width + "px";
            ctx.canvas.style.height = height + "px";
            ctx.canvas.height = height * window.devicePixelRatio;
            ctx.canvas.width = width * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
    };

function Pies(elem, data, options){

    this.$elem = elem;
    this.options = $.extend(true, {}, defaultOptions, options || {});

    // console.log(this.options);

    this.data = data;

// console.log(data)

    this.init();
}

Pies.prototype = {
    constructor: Pies,
    init: function(){
        this.createCanvas();
        this.createTitle();

        this.draw();
    },

    getClientSlideLength: function(){
        // var offset = this.$elem.offset();
        return this.options.width ? this.options.width: this.$elem.width();
    },

    createCanvas: function(){
        var canvas = $('<canvas></canvas>');
        var canvasDom = canvas[0];

        this.slideLength = this.getClientSlideLength();

        canvasDom.width = this.slideLength;
        canvasDom.height = this.slideLength;


        this.$elem.prepend( canvas );

        this.canvas = canvas;

        this.context = canvasDom.getContext('2d');

        retinaScale(this.context);
    },

    createTitle: function(){
        var title = $('<h3></h3>')
        title.css({
            fontSize: this.options.titleFontSize * fontSizeRatio +'px',
            color: this.options.titleColor,
            textAlign: 'center',
            paddingBottom: '10px'
        }).text(this.options.title);

        this.$elem.prepend( title );

    },

    ease: function(t){
        if ((t /= 1) < (1 / 2.75)) {
            return 1 * (7.5625 * t * t);
        } else if (t < (2 / 2.75)) {
            return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75);
        } else if (t < (2.5 / 2.75)) {
            return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375);
        } else {
            return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375);
        }
    },

    linear: function (t) {
        return t;
    },

    animationLoop: function(callback,totalSteps,chartInstance, complete){

        var currentStep = 0,
            transitionFunction = this[this.options.transition] || this.ease;

        var that = this;

        var animationFrame = function(){
            currentStep++;
            var stepDecimal = currentStep/totalSteps;
            var easeDecimal = transitionFunction(stepDecimal);

            callback.call(chartInstance,easeDecimal,stepDecimal, currentStep);

            if (currentStep < totalSteps){
                chartInstance.animationFrame = requestAnimFrame(animationFrame);
            } else{
                // onComplete.apply(chartInstance);

                complete && complete(chartInstance);
            }
        };
        requestAnimFrame(animationFrame);
    },

    drawLines: function(color, secondColor, lineWidth){

        var color = this.options.highLightColor;
        var secondColor = this.options.highLightSecondColor;
        var lineWidth = this.options.highLightLineWidth;

        var canvas = $('<canvas></canvas>');
        var canvasDom = canvas[0];

        // this.slideLength = this.getClientSlideLength();

        canvasDom.width = this.slideLength;
        canvasDom.height = this.slideLength;

        var ctx = canvasDom.getContext('2d');

        ctx.lineWidth = lineWidth;

        var counts = Math.ceil(this.slideLength * 2 / lineWidth);
        var addLength = 0 - Math.sqrt(2) * lineWidth / 2;
        for(var i = 0; i < counts; i ++ ){

            ctx.beginPath();

            ctx.strokeStyle = i % 2 == 0 ? color: secondColor;

            var diff = lineWidth/2 + i * lineWidth
            ctx.moveTo(addLength, diff);

            ctx.lineTo(diff, addLength);
            ctx.stroke();
        }

        // $('body').append(canvas);

        return canvasDom;

    },

    //扇形
    drawSector: function ( sDeg, eDeg) {

        if(sDeg != eDeg){

            var x = y = radius = this.slideLength/2;
            var ringRadius = this.options.ringLineWidth / 2;
            // 初始保存
            this.context.save();
            // 位移到目标点
            this.context.translate(x, y);
            this.context.beginPath();
            // 画出圆弧
            this.context.arc(0,0,radius,sDeg, eDeg);
            // 再次保存以备旋转
            this.context.save();
            // 旋转至起始角度
            this.context.rotate(eDeg);
            // 移动到终点，准备连接终点与圆心
            // console.log(this.options.fixed);
            if(this.options.fixed){
                this.context.arc(radius-ringRadius,0,ringRadius,0, Math.PI*2 );
            }
            this.context.moveTo(radius,0);
            // 连接到圆心
            this.context.lineTo(0,0);
            // 还原
            this.context.restore();
            // 旋转至起点角度
            this.context.rotate(sDeg);
            // 从圆心连接到起点
            this.context.lineTo(radius,0);
            if(this.options.fixed){
                this.context.arc(radius-ringRadius,0,ringRadius, 0, Math.PI * 2);
            }
            this.context.closePath();
            // 还原到最初保存的状态
            this.context.restore();
        }
        return this;
    },

    drawText: function(){
        var textFontSize = this.options.textFontSize * fontSizeRatio;
        if(!this.options.textHtml){
            var x = y = this.slideLength / 2;

            this.context.save();
            this.context.beginPath();
            this.context.fillStyle = this.options.textColor;
            this.context.font = 'bold '+textFontSize + 'px Arial';
            this.context.textAlign = 'center';

            this.context.fillText(this.data.count,x,y + textFontSize/2);

            this.context.restore();
        } else {
            this.$elem.css('position', 'relative');

            var textLegend = $('<p></p>');
            var top = this.canvas.offset().top - this.$elem.offset().top;
            textLegend.css({
                font: 'bold '+textFontSize + 'px Arial',
                lineHeight: this.slideLength + 'px',
                top: top,
                left: 0,
                width: this.slideLength,
                height: this.slideLength,
                color: this.options.textColor,
                position: 'absolute',
                textAlign: 'center'
            }).text(this.data.count);

            this.$elem.append( textLegend );
        }

        return this;
    },

    draw: function(){
        var radius = this.slideLength / 2;
        var pat, cvs;
        
        if(this.options.highLightSecondColor === false){
            pat = this.options.highLightColor;
        } else {
            cvs = this.drawLines();
            pat = this.context.createPattern(cvs,"repeat");
        }

        var fixedDeg;

        var that = this;

        var dataSet, total, dataItem, fillColor;

        var percent, endDeg, startDeg, nowEndDeg;

        var i = 0;

        // console.log(1);


        if($.isArray(this.data)){
            dataSet = [];
            total = 0;
            for(var j = 0; j < this.data.length; j++){
                dataItem = this.data[j];
                total += dataItem.value;

                dataSet.push({
                    value: dataItem.value,
                    color: dataItem.color
                });
            }
        } else {
            dataSet = [{
                value: this.data.count,
                color: pat
            }];

            total = this.data.total;

            percent = this.data.count / this.data.total;

            endDeg = Math.PI * (2 * percent - .5 );
        }




        startDeg = -Math.PI /2;

        // nowEndDeg = startDeg;


        if(this.data.count > 0 && this.options.fixed){

            fixedDeg = Math.asin( this.options.ringLineWidth / 4 / radius ) * 2

            if( endDeg - startDeg > fixedDeg ){
                startDeg += fixedDeg;

                if(endDeg - startDeg > fixedDeg) {
                    endDeg += (this.data.count == this.data.total? fixedDeg: (-1 * fixedDeg));
                }

                nowEndDeg = startDeg;
            }
            
        }

        // console.log(dataSet);

        var loopDataSet = function(){
            var self = that;
            // console.log(i);
            if(i < dataSet.length){

                percent = dataSet[i].value / total;

                endDeg = Math.PI * (2 * percent) + startDeg;

                // console.log(total, percent, startDeg, endDeg);

                dataSet[i].startDeg = startDeg;

                dataSet[i].endDeg = endDeg;

                nowEndDeg = startDeg;

                fillColor = dataSet[i].color;

                self.animationLoop(function(easeDecimal,stepDecimal, currentStep ){
                    self.context.clearRect(0,0,self.slideLength,self.slideLength);
                    var animDecimal = (easeDecimal) ? easeDecimal : 1;

                    // console.log(easeDecimal);

                    nowEndDeg = ((endDeg - startDeg) * animDecimal) + startDeg;

                    // console.log(endDeg, nowEndDeg);

                    self.context.fillStyle = this.options.fillColor;
                    self.context.beginPath();
                    self.context.arc(radius,radius,radius,0,Math.PI*2);
                    self.context.fill();

                    for (var n = 0; n < i; n++) {
                        self.context.fillStyle = dataSet[n].color;
                        self.context.beginPath();
                        self.drawSector(dataSet[n].startDeg , dataSet[n].endDeg);
                        self.context.fill();
                        self.context.closePath();
                    }

                    self.context.fillStyle = fillColor;
                    self.context.beginPath();
                    self.drawSector(startDeg , nowEndDeg);
                    self.context.fill();



                    self.context.fillStyle = '#fff';
                    self.context.beginPath();
                    self.context.arc(radius,radius,radius - self.options.ringLineWidth,0,Math.PI*2);
                    self.context.fill();

                }, Math.ceil(500 * percent) || 1, self, function(){
                    startDeg = endDeg;
                    i++;

                    loopDataSet();

                    // console.log('end');
                });
            }
        }

        loopDataSet();

        


        this.drawText();
    }
}


$.fn.pies = function(data, options){

    return new Pies(this, data, options);
}
})(Zepto);
