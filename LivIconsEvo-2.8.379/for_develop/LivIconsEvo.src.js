/********************************************************************************************
 * @name:       LivIconsEvo.js - the main JS file of LivIcons (Live Icons) Evolution
 * @version:    2.8.XXX (XXX is a total number of icons)
 * @URL:        https://livicons.com
 * @copyright:  (c) 2013-2019 DeeThemes (https://codecanyon.net/user/DeeThemes)
 * @licenses:   https://codecanyon.net/licenses/regular
                https://codecanyon.net/licenses/extended
*********************************************************************************************/

(function(jQuery, undefined) {

    "use strict";

    var isWP = false, //is WordPress
        TweenMax = window.TweenMax,
        TimelineMax = window.TimelineMax,
        Power0 = window.Power0,
        Snap = window.Snap,
        verge = window.verge;
    if (window.DeeThemes_GS && window.DeeThemes_Snap && window.DeeThemes_Verge) {
        isWP = true;
    }
    if (isWP) {
        TweenMax =  window.DeeThemes_GS.TweenMax;
        TimelineMax =  window.DeeThemes_GS.TimelineMax;
        Power0 = window.DeeThemes_GS.Power0;
        Snap =  window.DeeThemes_Snap;
        verge =  window.DeeThemes_Verge;
    }

    //Getting LivIcons Evolution default options
    var defaultOptions = window.LivIconsEvoDefaults();
        
    //check for IE9 - IE11 and Edge for line drawing effect.
    //(It doesn't work in those browsers if stroke-width is not integer)
    var isIE = ('ActiveXObject' in window) ? true : false,
        isEdge = (navigator.userAgent.match(/Edge\/\d+/)) ? true : false;

    //In case of forgetting to add the ending slash
    if ( !defaultOptions.pathToFolder.match(/(\/)$/) && defaultOptions.pathToFolder.trim() !== '' ) {
        defaultOptions.pathToFolder += '/';
    }

    //the main function to create LivIcon Evolution
    function createLiviconEvo (holder, options) {
        //to prevent "flickering"
        holder.css('visibility', 'hidden');

        //create Snap object
        var svg = Snap(holder.find('svg')[0]);
        svg.attr({preserveAspectRatio:"xMinYMin meet"});
        var svgCenterOrigin = svg.attr('viewBox').w / 2 +' '+ svg.attr('viewBox').h / 2;
        svg.selectAll('desc').forEach(function (d) {
            if (d.innerSVG() === 'Created with Snap') {
                jQuery(d.node).text('LivIcons Evolution');
            }
        });

        //jQuery object
        var $svg = jQuery(svg.node);

        //creating service SVG groups for rotation, flipping and sharp edges
        var mainGroup = svg.select('g.lievo-main'),
            gr = svg.g().addClass('lievo-setrotation');
        svg.prepend(gr);
        gr = gr.g().addClass('lievo-setsharp');
        gr = gr.g().addClass('lievo-setflip');
        gr.append(mainGroup);


        /***********Visualization**********/

        //leave only one icon's data for morph's state
        if (options.morph) {
            if (options.morphState === 'end') {
                $svg.find('g.lievo-main g.lievo-morphstartstate').remove();
                options.curMorphState = "end";
            } else {
                $svg.find('g.lievo-main g.lievo-morphendstate').remove();
                options.curMorphState = "start";
            }
        } else {
            options.curMorphState = 'not morph';
        }

        //leave only one icon style
        switch (options.style) {
            case 'solid': {
                $svg.find('g.lievo-main g.lievo-solidicon').siblings(':not(g.lievo-common)').remove();
                break;
            }
            case 'lines':
            case 'lines-alt':
            case 'linesAlt': {
                $svg.find('g.lievo-main g.lievo-lineicon').siblings(':not(g.lievo-common)').remove();
                break;
            }
            default: {
                //original or filled icon
                $svg.find('g.lievo-main g.lievo-filledicon').siblings(':not(g.lievo-common)').remove();
            }
        }
        
        //adding invisible rectangle for "tryToSharpen" option
        var helperRectangle = mainGroup.rect(-19,-19,4,4).addClass('lievo-checkshift lievo-donotdraw lievo-nohoverstroke lievo-nohovercolor').attr({fill: 'none', stroke:'#ffffff', 'stroke-width': 2, 'stroke-linecap': 'butt', 'stroke-linejoin':'round', opacity: 0});
        if (svg.attr('data-shift')) {
            if (svg.attr('data-shift') === 'x') {
                helperRectangle.attr('x', -20);
            } else if (svg.attr('data-shift') === 'y') {
                helperRectangle.attr('y', -20);
            } else if (svg.attr('data-shift') === 'xy') {
                helperRectangle.attr({'x': -20, 'y':-20});
            }
        }
        if (options.style === 'solid' && svg.attr('data-solidshift')) {
            if (svg.attr('data-solidshift') === 'x') {
                helperRectangle.attr('x', -19.5);
            } else if (svg.attr('data-solidshift') === 'y') {
                helperRectangle.attr('y', -19.5);
            } else if (svg.attr('data-solidshift') === 'xy') {
                helperRectangle.attr({'x': -19.5, 'y':-19.5});
            }
        }

        var imageContainer,
            pattern,
            patternGroup,
            backupFill;
        //morph icons can have an image inside
        if (options.morph && options.morphImage) {
            imageContainer = svg.select('.lievo-morphimage');
            if (imageContainer) {
                pattern = svg.ptrn(0, 0, '100%', '100%', 0, 0, 0, 0);
                pattern.node.removeAttribute('viewBox');
                patternGroup = pattern.attr('patternUnits', 'userSpaceOnUse').addClass('lievo-morphpattern').toDefs().g();
            } else {
                options.morphImage = false;
            }
            backupFill = svg.select('.lievo-morphimage').attr('fill');
            patternGroup.rect(0,0,60,60).attr({fill: backupFill, stroke:'#ffffff', 'stroke-width': 0}).addClass('lievo-donotdraw');
        }

        //select all SVG primitives
        var shapes = svg.selectAll('circle, ellipse, image, line, path, polygon, polyline, rect, text, use');
        shapes.forEach(function(shape) {
            if (!jQuery(shape.node).attr('stroke')) {
                shape.attr({stroke: 'none', 'stroke-width': 0});
            }
            if (!jQuery(shape.node).attr('fill')) {
                shape.attr('fill', 'none');
            }
        });

        //change stroke styles for linecap and linejoin
        if (options.strokeStyle === 'round') {
            shapes.forEach(function(shape) {
                if ( shape.attr('stroke') !== 'none' && !shape.hasClass('lievo-savelinecap') ) {
                    shape.node.setAttribute('stroke-linecap', 'round');
                    shape.node.setAttribute('stroke-linejoin', 'round');
                }
            });
        } else if (options.strokeStyle === 'square') {
            shapes.forEach(function(shape) {
                if ( shape.attr('stroke') !== 'none' && !shape.hasClass('lievo-savelinecap') ) {
                    shape.node.setAttribute('stroke-linecap', 'square');
                    shape.node.setAttribute('stroke-linejoin', 'miter');
                    if (!shape.attr('stroke-miterlimit')) {
                        shape.attr('stroke-miterlimit', '10');
                    }
                }
            });
        }

        //storing init data
        shapes.forEach(function(shape) {
            shape.data('initStrokeWidth', shape.attr('stroke-width'));
            shape.data('initStrokeLinecap', shape.attr('stroke-linecap'));
            shape.data('initStrokeLinejoin', shape.attr('stroke-linejoin'));
        });

        //change icon style
        switch (options.style) {
            case 'filled': {
                shapes.forEach(function(shape) {
                    if ( shape.attr('stroke') !== 'none' && !shape.hasClass('lievo-savestroke') ) {
                        shape.attr('stroke', options.strokeColor);
                    }
                    if ( shape.attr('fill') !== 'none' && !shape.hasClass('lievo-savefill') ) {
                        shape.attr('fill', options.fillColor);
                    }
                    if ( shape.hasClass('lievo-likestroke') ) {
                        shape.attr('fill', options.strokeColor);
                    }
                });
                break;
            }
            case 'lines': {
                shapes.forEach(function(shape) {
                    if ( shape.attr('stroke') !== 'none' && !shape.hasClass('lievo-savestroke') ) {
                        shape.attr('stroke', options.strokeColor);
                    }
                    if (!shape.hasClass('lievo-savefill')) {
                        shape.attr('fill', 'none');
                    }
                    if ( shape.hasClass('lievo-likestroke') ) {
                        shape.attr('fill', options.strokeColor);
                    }
                });
                break;
            }
            case 'lines-alt':
            case 'linesAlt': {
                shapes.forEach(function(shape) {
                    if ( shape.hasClass('lievo-altstroke') ) {
                        if ( shape.attr('stroke') !== 'none' ) {
                            shape.attr('stroke', options.strokeColorAlt);
                        }
                        if ( shape.hasClass('lievo-likestroke') ) {
                            shape.attr('fill', options.strokeColorAlt);
                        } else {
                            if (!shape.hasClass('lievo-savefill')) {
                                shape.attr('fill', 'none');
                            }
                        }
                    } else {
                        if ( shape.attr('stroke') !== 'none' && !shape.hasClass('lievo-savestroke') ) {
                            shape.attr('stroke', options.strokeColor);
                        }
                        if ( shape.hasClass('lievo-likestroke') ) {
                            shape.attr('fill', options.strokeColor);
                        } else {
                            if (!shape.hasClass('lievo-savefill')) {
                                shape.attr('fill', 'none');
                            }
                        }
                    }
                });
                break;
            }
            case 'solid': {
                shapes.forEach(function(shape) {
                    if ( shape.hasClass('lievo-solidbg') ) {
                        if ( shape.attr('stroke') !== 'none' && !shape.hasClass('lievo-savestroke') ) {
                            shape.attr('stroke', options.solidColorBg);
                        }
                        if ( shape.attr('fill') !== 'none' && !shape.hasClass('lievo-savefill') ) {
                            shape.attr('fill', options.solidColorBg);
                        }
                    } else {
                        if ( shape.attr('stroke') !== 'none' && !shape.hasClass('lievo-savestroke') ) {
                            shape.attr('stroke', options.solidColor);
                        }
                        if ( shape.attr('fill') !== 'none' && !shape.hasClass('lievo-savefill') ) {
                            shape.attr('fill', options.solidColor);
                        }
                    }
                });
                break;
            }
            default: {
                //do nothing, leave 'original' style
                break;
            }
        }

        //exactly now set the width of holder
        holder.css('width', options.size);

        //for WordPress
        if (isWP && holder.hasClass('livicon-evo-back-in-combined')) {
            holder.parent('.livicon-evo-combined').css('width', options.size);
            holder.css('width', '100%');
        }

        //morph icons can have an image inside
        if (options.morph && options.morphImage) {
            patternGroup.image(options.morphImage, 0, 0, '100%', '100%');
            pattern.select('image').attr('preserveAspectRatio', 'xMidYMid slice');
            svg.select('.lievo-morphimage').attr('fill', pattern);
        }

        //change stroke-width
        var halfOfStroke;
        var strokeWidthCalculation = function () {
            options.scaleStrokeFactor = holder.width() / 60;
            if (options.scaleStrokeFactor <= 0) {
                options.scaleStrokeFactor = 1;
            }
            if (options.strokeWidth !== 'original') {
                shapes.forEach(function(shape) {
                    if (shape.attr('stroke') !== 'none') {
                        var units = (''+options.strokeWidth).replace(/[0-9.]/g, ''),
                            currentStrokeFactor = shape.data('initStrokeWidth').replace(/[^0-9.]/g, '') / 2,
                            resultStroke = +(''+options.strokeWidth).replace(/[^0-9.]/g, '') / options.scaleStrokeFactor * currentStrokeFactor;
                        shape.node.setAttribute('stroke-width', resultStroke + units);
                        shape.data('curStrokeWidth', resultStroke + units);
                    }
                });
                halfOfStroke = (''+options.strokeWidth).replace(/[^0-9.]/g, '') / options.scaleStrokeFactor / 2;
            } else {
                if (options.tryToSharpen && options.scaleStrokeFactor < 0.5) {
                    shapes.forEach(function(shape) {
                        if (shape.attr('stroke') !== 'none') {
                            var units = shape.data('initStrokeWidth').replace(/[0-9.]/g, ''),
                                currentStrokeFactor = shape.data('initStrokeWidth').replace(/[^0-9.]/g, '') / 2,
                                resultStroke = 1 / options.scaleStrokeFactor * currentStrokeFactor;
                            shape.node.setAttribute('stroke-width', resultStroke + units);
                            shape.data('curStrokeWidth', resultStroke + units);
                        }
                    });
                    halfOfStroke = 1 / options.scaleStrokeFactor / 2;
                } else {
                    shapes.forEach(function(shape) {
                        if (shape.attr('stroke') !== 'none') {
                            shape.data('curStrokeWidth', shape.data('initStrokeWidth'));
                        }
                    });
                    halfOfStroke = svg.select('.lievo-checkshift').attr('stroke-width').replace(/[^0-9.]/g, '') / 2;
                }
            }

            //calculating stroke-width on hover
            if (options.strokeWidthFactorOnHover === 0 || options.strokeWidthFactorOnHover) {
                shapes.forEach(function(shape) {
                    if ( shape.attr('stroke') !== 'none' && !shape.hasClass('lievo-nohoverstroke') ) {
                        var curSW = shape.data('curStrokeWidth');
                        if (curSW) {
                            var units = (''+curSW).replace(/[0-9.]/g, ''),
                                resultStroke = +(''+curSW.replace(/[^0-9.]/g, '')) * options.strokeWidthFactorOnHover;
                            shape.data('hoverStrokeWidth', resultStroke + units);
                        }
                    }
                });
            }
        };
        strokeWidthCalculation();
        if (options.keepStrokeWidthOnResize) {
            jQuery(window).on('resize', function () {
                strokeWidthCalculation();
            });
        }

        //choosing color action on hover or when morphed
        var colorAction;
        if (options.colorsOnHover) {
            colorAction = options.colorsOnHover;
        }
        //if colorsWhenMorph for morph icons, then colorsOnHover is disabled
        if (options.morph && options.colorsWhenMorph) {
            options.colorsOnHover = false;
            colorAction = options.colorsWhenMorph;
        }

        //storing data and calculation colors change
        shapes.forEach(function(shape) {
            var fill = jQuery(shape.node).attr('fill'),
                color;
            shape.data('curFill', fill);
            shape.data('curStroke', shape.attr('stroke'));
            shape.data('curOpacity', shape.attr('opacity'));

            //calculating colors on hover or colors for change when morph
            if (colorAction) {
                if ( fill === 'none' ) {
                    shape.data('actionFill', 'none');
                } else if (fill.toLowerCase().match(/url\(/)) {
                    shape.data('actionFill', fill);
                } else {
                    if (colorAction === 'lighter') {
                        if ( options.style === 'solid' && shape.hasClass('lievo-solidbg') ) {
                            color = options.solidColorBgAction;
                        } else {
                            color = LighterDarker(fill, -options.saturation, options.brightness);
                        }
                    } else if (colorAction === 'darker') {
                        if ( options.style === 'solid' && shape.hasClass('lievo-solidbg') ) {
                            color = options.solidColorBgAction;
                        } else {
                            color = LighterDarker(fill, options.saturation, -options.brightness);
                        }
                    } else if (colorAction.replace(/[^hue]/g, '') === 'hue') {
                        if ( options.style === 'solid' && shape.hasClass('lievo-solidbg') ) {
                            color = options.solidColorBgAction;
                        } else {
                            color = hueRotate(fill, colorAction.replace(/[^0-9.]/g, '') ? colorAction.replace(/[^0-9.]/g, '') : 0);
                        }
                    } else if (colorAction === 'custom') {
                        switch (options.style) {
                            case 'solid': {
                                if ( shape.hasClass('lievo-solidbg') ) {
                                    color = options.solidColorBgAction;
                                } else {
                                    color = options.solidColorAction;
                                }
                                break;
                            }
                            case 'lines': {
                                color = options.strokeColorAction;
                                break;
                            }
                            case 'lines-alt':
                            case 'linesAlt': {
                                if (shape.hasClass('lievo-altstroke')) {
                                    color = options.strokeColorAltAction;
                                } else {
                                    color = options.strokeColorAction;
                                }
                                break;
                            }
                            default: {
                                //original or filled icon
                                if ( shape.hasClass('lievo-likestroke') ) {
                                    color = options.strokeColorAction;
                                } else {
                                    color = options.fillColorAction;
                                }
                                break;
                            }
                        }
                    }
                    shape.data('actionFill', color);
                }

                if ( shape.attr('stroke') === 'none' ) {
                    shape.data('actionStroke', 'none');
                } else {
                    if (colorAction === 'lighter') {
                        if ( options.style === 'solid' && shape.hasClass('lievo-solidbg') ) {
                           color = options.solidColorBgAction;
                        } else {
                           color = LighterDarker(shape.attr('stroke'), -options.saturation, options.brightness);
                        }
                    } else if (colorAction === 'darker') {
                        if ( options.style === 'solid' && shape.hasClass('lievo-solidbg') ) {
                           color = options.solidColorBgAction;
                        } else {
                           color = LighterDarker(shape.attr('stroke'), options.saturation, -options.brightness);
                        }
                    } else if (colorAction.replace(/[^hue]/g, '') === 'hue') {
                        if ( options.style === 'solid' && shape.hasClass('lievo-solidbg') ) {
                           color = options.solidColorBgAction;
                        } else {
                           color = hueRotate(shape.attr('stroke'), colorAction.replace(/[^0-9.]/g, '') ? colorAction.replace(/[^0-9.]/g, '') : 0);
                        }
                    } else if (colorAction === 'custom') {
                        switch (options.style) {
                            case 'solid': {
                                if ( shape.hasClass('lievo-solidbg') ) {
                                    color = options.solidColorBgAction;
                                } else {
                                    color = options.solidColorAction;
                                }
                                break;
                            }
                            case 'lines': {
                                color = options.strokeColorAction;
                                break;
                            }
                            case 'lines-alt':
                            case 'linesAlt': {
                                if ( shape.hasClass('lievo-altstroke') ) {
                                    color = options.strokeColorAltAction;
                                } else {
                                    color = options.strokeColorAction;
                                }
                                break;
                            }
                            default: {
                                //original or filled icon
                                color = options.strokeColorAction;
                                break;
                            }
                        }
                    }
                    shape.data('actionStroke', color);
                }
            }
        });

        //set rotation and/or flip
        if (options.rotate) {
            TweenMax.set(svg.select('g.lievo-setrotation').node, {rotation: options.rotate, svgOrigin: svgCenterOrigin});
            if (options.morph && options.morphImage && !options.allowMorphImageTransform) {
                var patternGr = pattern.select('g');
                if (!options.flipVertical && options.flipHorizontal) {
                    patternGr.transform('r' + options.rotate + ',30,30');
                } else if (options.flipVertical && !options.flipHorizontal) {
                    patternGr.transform('r' + options.rotate + ',30,30');
                } else {
                    patternGr.transform('r' + (-options.rotate) + ',30,30');
                }
            }
        }
        if (options.flipVertical && !options.flipHorizontal) {
            svg.select('g.lievo-setflip').transform('s1,-1,30,30');
            if (options.morph && options.morphImage && !options.allowMorphImageTransform) {
                pattern.select('image').transform('s1,-1,30,30');
            }
        } else if (options.flipHorizontal && !options.flipVertical) {
            svg.select('g.lievo-setflip').transform('s-1,1,30,30');
            if (options.morph && options.morphImage && !options.allowMorphImageTransform) {
                pattern.select('image').transform('s-1,1,30,30');
            }
        } else if (options.flipVertical && options.flipHorizontal) {
            svg.select('g.lievo-setflip').transform('s-1,-1,30,30');
            if (options.morph && options.morphImage && !options.allowMorphImageTransform) {
                pattern.select('image').transform('s-1,-1,30,30');
            }
        }


        /***********Animations***********/

        if (options.animated) {
            //getting global animation options from SVG icon file
            if (svg.attr('data-animoptions')) {
                var svgAnimOpts = JSON.parse( svg.attr('data-animoptions').replace(/\'/g,'"') );
                if (svgAnimOpts.duration) {
                    options.defaultDuration = strToNum(svgAnimOpts.duration);
                } else {
                    options.defaultDuration = 1;
                }
                if (svgAnimOpts.repeat) {
                    if (svgAnimOpts.repeat === 'loop') {
                        options.defaultRepeat = -1;
                    } else {
                        options.defaultRepeat = strToNum(svgAnimOpts.repeat);
                    }
                } else {
                    options.defaultRepeat = 0;
                }
                if (svgAnimOpts.repeatDelay) {
                    options.defaultRepeatDelay = strToNum(svgAnimOpts.repeatDelay);
                } else {
                    options.defaultRepeatDelay = 0.5;
                }
            } else {
                options.defaultDuration = 1;
                options.defaultRepeat = 0;
                options.defaultRepeatDelay = 0.5;
            }

            //calculating duration
            if (options.duration === 'default') {
                options.useDuration = options.defaultDuration;
            } else {
                options.useDuration = strToNum(options.duration);
            }
            if (isNaN(options.useDuration)) {
                options.useDuration = 1;
            }

            //calculating repeat
            if (options.repeat === 'default') {
                options.useRepeat = options.defaultRepeat;
            } else if (options.repeat === 'loop') {
                options.useRepeat = -1;
            } else {
                options.useRepeat = strToNum(options.repeat);
            }
            if (isNaN(options.useRepeat)) {
                options.useRepeat = 0;
            }
            if (options.useRepeat !== -1 && options.useRepeat < 0) {
                options.useRepeat = 0;
            }

            //calculating a delay before repeats
            if (options.repeatDelay === 'default') {
                options.useRepeatDelay = options.defaultRepeatDelay;
            } else {
                options.useRepeatDelay = strToNum(options.repeatDelay);
            }
            if (isNaN(options.useRepeatDelay)) {
                options.useRepeatDelay = options.defaultRepeatDelay;
            }

            //to prevent firing onUpdate callbacks before onStart ones
            if (options.delay <= 0) {
                options.delay = 0.001;
            }
            if (options.useRepeatDelay <= 0) {
                options.useRepeatDelay = 0.001;
            }
            if (options.drawDelay <= 0) {
                options.drawDelay = 0.001;
            }
            if (options.eraseDelay <= 0) {
                options.eraseDelay = 0.001;
            }

            //morph icons can't be repeated
            if (options.morph) {
                options.defaultRepeat = 0;
                options.useRepeat = 0;
                options.defaultRepeatDelay = 0;
                options.useRepeatDelay = 0;
            }
        } else {
            options.defaultDuration = 0;
            options.defaultRepeat = 0;
            options.defaultRepeatDelay = 0;
        }

        //Timeline for icon's drawing
        var drawTL = holder.data('drawTL');
        if (drawTL) {
            drawTL.pause().kill().clear();
        } else {
            drawTL = new TimelineMax({paused: true});
        }

        //Timeline for icon's animation
        var mainTL = holder.data('mainTL');
        if (mainTL) {
            mainTL.pause().kill().clear();
        } else {
            mainTL = new TimelineMax({paused: true});
        }

        var colorTL;
        if (options.animated) {
            //creates animations of each SVG shape
            var animatedShapes = svg.selectAll('circle, ellipse, g, image, line, path, polygon, polyline, rect, text, use');
            var defaultTL = new TimelineMax();

            if (options.morph && options.colorsWhenMorph) {
                var stroke,
                    fill,
                    tweenStroke,
                    tweenFill;
                colorTL = new TimelineMax();
                animatedShapes.forEach(function(shape) {
                    if (options.morphState !== 'end') {
                        if ( !shape.hasClass('lievo-nohovercolor') && shape.type.toLowerCase() !== 'g' ) {
                            stroke = shape.data('actionStroke');
                            fill = shape.data('actionFill');
                            if ( stroke && stroke !== 'none' ) {
                                tweenStroke = TweenMax.to(shape.node, options.useDuration, {stroke: stroke});
                                colorTL.add(tweenStroke, 0);
                            }
                            if ( fill && fill !== 'none' && !fill.match(/url\(/) ) {
                                tweenFill = TweenMax.to(shape.node, options.useDuration, {fill: fill});
                                colorTL.add(tweenFill, 0);
                            }
                        }
                    } else {
                        if ( !shape.hasClass('lievo-nohovercolor') && shape.type.toLowerCase() !== 'g' ) {
                            stroke = shape.data('actionStroke');
                            fill = shape.data('actionFill');
                            if ( stroke && stroke !== 'none' ) {
                                TweenMax.set(shape.node, {stroke: stroke});
                            }
                            if ( fill && fill !== 'none' && !fill.match(/url\(/) ) {
                                TweenMax.set(shape.node, {fill: fill});
                            }

                            stroke = shape.data('curStroke');
                            fill = shape.data('curFill');
                            if ( stroke && stroke !== 'none') {
                                tweenStroke = TweenMax.to(shape.node, options.useDuration, {stroke: stroke});
                                colorTL.add(tweenStroke, 0);
                            }
                            if ( fill && fill !== 'none' && !fill.match(/url\(/) ) {
                                tweenFill = TweenMax.to(shape.node, options.useDuration, {fill: fill});
                                colorTL.add(tweenFill, 0);
                            }
                        }
                    }
                });
            }

            animatedShapes.forEach(function(shape) {
                if (shape.attr('data-animdata')) {
                    var animdata = JSON.parse(shape.attr('data-animdata').replace(/\'/g,'"')),
                        timeLineTemp = new TimelineMax();
                    animdata.steps.forEach(function (steps) {
                        for(var key in steps.vars) {
                            if ( steps.vars.hasOwnProperty(key) ) {
                                steps.vars[key] = strToNum(steps.vars[key]);
                                if (steps.vars[key] !== 'none') {
                                    steps.vars[key] = strToBool(steps.vars[key]);
                                }
                            }
                        }

                        if (strToNum(steps.duration) === 0) {
                            steps.duration = 0.001;
                        }

                        if (steps.vars.ease === 'none' || !steps.vars.ease) {
                            steps.vars.ease = Power0.easeNone;
                        } else {
                            steps.vars.ease = parseEase(steps.vars.ease);
                        }

                        if (steps.vars.path) {
                            steps.vars.morphSVG = steps.vars.path;
                        }

                        if (steps.vars.bezier && steps.vars.bezier.values) {
                            if( typeof steps.vars.bezier.values === 'string' ) {
                                var str = Snap.path.toCubic(steps.vars.bezier.values).toString();
                                str = str.replace(/[M|m]/g,'').replace(/[C|c]/g,',');
                                var arr = str.split(',');
                                steps.vars.bezier.values = [];
                                for (var i = 0; i < arr.length; i+=2) {
                                    var point = {};
                                    point.x = arr[i];
                                    point.y = arr[i+1];
                                    steps.vars.bezier.values.push(point);
                                }
                            }
                        }

                        var tween;
                        if (isIE || isEdge) {//special actions for IE9-IE11 and MS Edge
                            if (steps.vars.drawSVG) {
                                if (steps.vars.drawSVG === '0%' || steps.vars.drawSVG === 0) {
                                    tween = TweenMax.to(shape.node, +steps.duration, steps.vars);
                                    tween.eventCallback("onStart", function () {
                                        if (shape.data('initStrokeLinecap').toLowerCase() === 'square') {
                                            TweenMax.set(shape.node, {attr:{'stroke-linecap': 'round'}});
                                        }
                                        if (shape.data('initStrokeLinejoin').toLowerCase() === 'miter') {
                                            TweenMax.set(shape.node, {attr:{'stroke-linejoin': 'round'}});
                                        }
                                    });
                                } else if (steps.vars.drawSVG === '100%') {
                                    tween = TweenMax.to(shape.node, +steps.duration, steps.vars);
                                    tween.eventCallback("onComplete", function () {
                                        if (shape.data('initStrokeLinecap').toLowerCase() === 'square') {
                                            TweenMax.set(shape.node, {attr:{'stroke-linecap': 'square'}});
                                        }
                                        if (shape.data('initStrokeLinejoin').toLowerCase() === 'miter') {
                                            TweenMax.set(shape.node, {attr:{'stroke-linejoin': 'miter'}});
                                        }
                                    });
                                } else {
                                    tween = TweenMax.to(shape.node, +steps.duration, steps.vars);
                                }
                            } else {
                                tween = TweenMax.to(shape.node, +steps.duration, steps.vars);
                            }
                        } else {
                            tween = TweenMax.to(shape.node, +steps.duration, steps.vars);
                        }

                        timeLineTemp.add(tween, steps.position || '+=0');
                        defaultTL.add(timeLineTemp, 0);
                    });
                    shape.node.removeAttribute('data-animdata');
                }
            });
            mainTL.add(defaultTL, 0);
            defaultTL.duration(options.useDuration);
            if (options.morph && options.colorsWhenMorph) {
                mainTL.add(colorTL, 0);
                colorTL.duration(options.useDuration);
            }
            mainTL.delay(options.delay).repeat(options.useRepeat).repeatDelay(options.useRepeatDelay);
        } else {
            var delData = svg.selectAll('circle, ellipse, g, image, line, path, polygon, polyline, rect, text, use');
            delData.forEach(function(shape) {
                shape.node.removeAttribute('data-animdata');
            });
        } //end if options.animated

        //storing timelines
        holder.data('drawTL', drawTL);
        holder.data('mainTL', mainTL);

        //events on what element
        if (options.eventOn === 'self' || !options.eventOn) {
            options.eventElement = holder;
        } else if (options.eventOn === 'parent') {
            options.eventElement = holder.parent();
        } else if (options.eventOn === 'grandparent') {
            options.eventElement = holder.parent().parent();
        } else {
            options.eventElement = jQuery(options.eventOn);
        }

        //for WordPress
        var targetElement;
        if (isWP && holder.hasClass('livicon-evo-back-in-combined')) {
            targetElement = holder.parent('.livicon-evo-combined');
            if (options.eventOn === 'self' || !options.eventOn) {
                options.eventElement = targetElement;
            } else if (options.eventOn === 'parent') {
                options.eventElement = targetElement.parent();
            } else if (options.eventOn === 'grandparent') {
                options.eventElement = targetElement.parent().parent();
            }
        }
        if (isWP && holder.parent().hasClass('livicon-evo-front-in-combined')) {
            targetElement = holder.parent('.livicon-evo-front-in-combined');
            if (options.eventOn === 'self' || !options.eventOn) {
                options.eventElement = holder;
            } else if (options.eventOn === 'parent') {
                options.eventElement = targetElement.parent();
            } else if (options.eventOn === 'grandparent') {
                options.eventElement = targetElement.parent().parent();
            }
        }

        var funcClickHandler,
            funcHoverInHandler,
            funcHoverOutHandler;
        if (options.animated) {
            //if icon is not "morph"
            if (!options.morph) {

                //regular icon is clicked
                if (options.eventType === 'click') {
                    funcClickHandler = function() {
                        if (options.useRepeat === -1) {
                            if (!options.ending) {
                                if (options.drawn) {
                                    options.ending = true;
                                    holder.playLiviconEvo();
                                }
                            } else {
                                if (mainTL.isActive()) {
                                    mainTL.tweenTo(mainTL.duration(), {onComplete:
                                        function () {
                                            mainTL.pause().totalProgress(0);
                                            if (typeof options.afterAnim === 'function') {
                                                options.afterAnim();
                                            }
                                            options.ending = false;
                                        }
                                    });
                                }
                            }
                        } else {
                            if (options.drawn) {
                                holder.playLiviconEvo();
                                options.ending = false;
                            }
                        }
                    };
                    options.eventElement.on('click.LiviconEvo', funcClickHandler);

                //regular icon is hovered
                } else if (options.eventType === 'hover') {
                    funcHoverInHandler = function() {
                        if (!options.ending) {
                            if (options.drawn) {
                                holder.playLiviconEvo();
                            }
                        }
                    };
                    funcHoverOutHandler = function() {
                        if (mainTL.isActive()) {
                            options.ending = true;
                            mainTL.tweenTo(mainTL.duration(), {onComplete:
                                function () {
                                    mainTL.pause().totalProgress(0);
                                    if (options.useRepeat === -1) {
                                        if (typeof options.afterAnim === 'function') {
                                            options.afterAnim();
                                        }
                                    }
                                    options.ending = false;
                                }
                            });
                        }
                    };

                    //if looped animation
                    if (options.useRepeat === -1) {
                        options.eventElement.on('mouseenter.LiviconEvo', funcHoverInHandler).on('mouseleave.LiviconEvo', funcHoverOutHandler);

                    //if not looped animation
                    } else {
                        options.eventElement.on('mouseenter.LiviconEvo', function () {
                            if (options.drawn) {
                                holder.playLiviconEvo();
                            }
                        });
                    }
                }

            // animated "morph" icon
            } else if (options.morph) {

                //"morph" icon is clicked
                if (options.eventType === 'click') {
                    funcClickHandler = function() {
                        if ( options.drawn ) {
                            holder.playLiviconEvo();
                        }
                    };
                    options.eventElement.on('click.LiviconEvo', funcClickHandler);

                //"morph" icon is hovered
                } else if (options.eventType === 'hover') {
                    funcHoverInHandler = function() {
                        if (options.drawn) {
                            holder.playLiviconEvo();
                        }
                    };
                    funcHoverOutHandler = function() {
                        if (options.drawn) {
                            mainTL.reverse();
                        }
                    };
                    options.eventElement.on('mouseenter.LiviconEvo', funcHoverInHandler).on('mouseleave.LiviconEvo', funcHoverOutHandler);
                }
            }
        } //end if options.animated

        //changing colors on hover
        if (options.colorsOnHover) {
            var funcHoverColorsIn = function() {
                if ( !drawTL.isActive() && options.drawn) {
                    shapes.forEach(function(shape) {
                        if ( !shape.hasClass('lievo-nohovercolor') ) {
                            var stroke = shape.data('actionStroke'),
                                fill = shape.data('actionFill');
                            if ( stroke && stroke !== 'none' ) {
                                TweenMax.to(shape.node, options.colorsHoverTime, {stroke: stroke});
                            }
                            if ( fill && fill !== 'none' && !fill.match(/url\(/) ) {
                                TweenMax.to(shape.node, options.colorsHoverTime, {fill: fill});
                            }
                        }
                    });
                }
            };
            var funcHoverColorsOut = function() {
                if ( !drawTL.isActive() && options.drawn) {
                    shapes.forEach(function(shape) {
                        if ( !shape.hasClass('lievo-nohovercolor') ) {
                            var stroke = shape.data('curStroke'),
                                fill = shape.data('curFill');
                            if ( stroke && stroke !== 'none') {
                                TweenMax.to(shape.node, options.colorsHoverTime, {stroke: stroke});
                            }
                            if ( fill && fill !== 'none' && !fill.match(/url\(/) ) {
                                TweenMax.to(shape.node, options.colorsHoverTime, {fill: fill});
                            }
                        }
                    });
                }
            };
            options.eventElement.on('mouseenter.LiviconEvo', funcHoverColorsIn ).on('mouseleave.LiviconEvo', funcHoverColorsOut );
        }

        //changing stroke-width on hover
        if (options.strokeWidthFactorOnHover === 0 || options.strokeWidthFactorOnHover) {
            var funcHoverStrokeWidthIn = function() {
                if ( !drawTL.isActive() && options.drawn) {
                    shapes.forEach(function(shape) {
                        if ( !shape.hasClass('lievo-nohoverstroke') ) {
                            var stroke = shape.data('hoverStrokeWidth');
                            if (stroke) {
                                TweenMax.to(shape.node, options.strokeWidthOnHoverTime, {attr:{'stroke-width': stroke}});
                            }
                        }
                    });
                }
            };
            var funcHoverStrokeWidthOut = function() {
                if ( !drawTL.isActive() && options.drawn) {
                    shapes.forEach(function(shape) {
                        if ( !shape.hasClass('lievo-nohoverstroke') ) {
                            var stroke = shape.data('curStrokeWidth');
                            if (stroke) {
                                TweenMax.to(shape.node, options.strokeWidthOnHoverTime, {attr:{'stroke-width': stroke}});
                            }
                        }
                    });
                }
            };
            options.eventElement.on('mouseenter.LiviconEvo', funcHoverStrokeWidthIn ).on('mouseleave.LiviconEvo', funcHoverStrokeWidthOut );
        }

        //adding touch events
        if (options.touchEvents) {
            if ( options.animated ||
                options.colorsOnHover ||
                (options.strokeWidthFactorOnHover === 0 || options.strokeWidthFactorOnHover) ) {
                options.eventElement.on('touchstart.LiviconEvo', function(e) {
                    e.preventDefault();
                    options.eventElement.trigger('mouseenter.LiviconEvo');
                }).on('touchend.LiviconEvo', function() {
                    var evt;
                    options.eventElement.trigger('mouseleave.LiviconEvo');
                    try {
                        options.eventElement[0].click();
                    } catch (err) {
                        if (typeof document.createEvent === 'function') {
                            evt = document.createEvent('MouseEvents');
                            evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                            options.eventElement.get(0).dispatchEvent(evt);
                        } else if (typeof window.MouseEvent === 'function') {
                            evt = new MouseEvent('click', {
                              'bubbles': true,
                              'cancelable': true
                            });
                            options.eventElement.get(0).dispatchEvent(evt);
                        }
                    }
                });
            }
        } //end if touchEvents

        //making icons sharp
        var pos = holder.find('svg')[0].getScreenCTM();
        if (pos) {
            //fix sub-pixel render bug in Firefox and IE
            var leftShift = (-pos.e % 1),
                topShift = (-pos.f % 1);
            if (leftShift === 0) {
                leftShift = 0;
            } else if (leftShift <= -0.5) {
                leftShift = leftShift+1;
            }
            if (topShift === 0) {
                topShift = 0;
            } else if (topShift <= -0.5) {
                topShift = topShift+1;
            }
            holder.find('svg').css({left: leftShift + 'px', top: topShift + 'px'});

            //shift for pixel sharp
            if (options.tryToSharpen) {
                var bb = svg.select('.lievo-checkshift'),
                    ptrn = svg.select('.lievo-morphpattern'),
                    mtx = Snap.matrix();

                if (bb) {
                    bb = bb.getBBox();
                    if( (bb.x + halfOfStroke) * pos.a % 1 !== 0 ) {
                        TweenMax.set(svg.select('g.lievo-setsharp').node, {
                            x: '+=' + ( ( (bb.x - halfOfStroke) * pos.a % 1 ) / pos.a || 0 ),
                            svgOrigin: svgCenterOrigin
                        });
                        mtx.e = ( ( (bb.x - halfOfStroke) * pos.a % 1 ) / pos.a || 0 );
                    }
                    if( (bb.y + halfOfStroke) * pos.d % 1 !== 0 ) {
                        TweenMax.set(svg.select('g.lievo-setsharp').node, {
                            y: '+=' + ( ( (bb.y - halfOfStroke) * pos.d % 1 ) / pos.d || 0 ),
                            svgOrigin: svgCenterOrigin
                        });
                        mtx.f = ( ( (bb.y - halfOfStroke) * pos.d % 1 ) / pos.d || 0 );
                    }
                    if (ptrn) {
                        ptrn.attr('patternTransform', mtx.toString());
                    }
                }
            }
        }

        //draw lines of an icon
        if (options.drawOnViewport && !options.drawOnce) {
            //calculating viewport's shift
            var shift, svgHeight = holder.find('svg').get(0).getBoundingClientRect().height;
            switch (options.viewportShift) {
                case 'none':
                case false: {
                    shift = 1;
                    break;
                }
                case 'one-half':
                case 'oneHalf': {
                    shift = svgHeight/2;
                    break;
                }
                case 'one-third':
                case 'oneThird': {
                    shift = svgHeight/3;
                    break;
                }
                case 'full': {
                    shift = svgHeight;
                    break;
                }
                default: {//one-half
                    shift = svgHeight/2;
                    break;
                }
            }
            var checkViewport = function () {
                if (!options.drawOnce) {
                    var windowsHeight = jQuery(window).height();
                    if (shift > windowsHeight) {
                        shift = windowsHeight - 10;
                    }
                    if ( verge.inViewport(holder, -shift) ) {
                        holder.pauseLiviconEvo();
                        holder.drawLiviconEvo();
                        options.drawOnce = true;
                    }
                }
            };
            checkViewport();
            jQuery(window).on('resize scroll', function () {
                checkViewport();
            });
        } else {
            holder.css('visibility', 'visible');
            options.drawOnce = true;
            options.drawn = true;
            if (options.autoPlay) {
                holder.playLiviconEvo();
            }
        }
    } //end createLiviconEvo()

    //the jQuery plugin
    jQuery.fn.extend({

        //The main method. Have to be called first before any other ones
        addLiviconEvo: function (opt, val) {
            var jsOptions;
            if (arguments.length < 2) {
                if ( opt === Object(opt) ) {
                    jsOptions = opt;
                } else {
                    jsOptions = {};
                }
            } else {
                if ( opt === Object(opt) ) {
                    jsOptions = opt;
                } else {
                    jsOptions = {};
                    jsOptions[opt] = val;
                }
            }

            return this.each(function() {
                var holder = jQuery(this),
                    initialOptions = holder.data('options'),
                    savedOptions = holder.data('savedOptions'),
                    options = {};

                //adding class for CSS styling
                holder.addClass('livicon-evo-holder');

                //Unbind previously attached events
                if (savedOptions && savedOptions.eventElement) {
                    savedOptions.eventElement.off('.LiviconEvo');
                    savedOptions.eventElement = undefined;
                }

                //create object with options from data-options attribute
                if (!!initialOptions) {
                    initialOptions = initialOptions.split(';');
                    initialOptions.forEach(function(property) {
                        var tmp = property.trim().split(/:(.+)/);
                        if (!!tmp[0] && !!tmp[1]) {
                            options[tmp[0].trim()] = tmp[1].trim();
                        }
                    });
                }

                //combine all options from defaults, from data-options attribute and any JavaScript passed
                options = jQuery.extend( cloneObj(defaultOptions), options, jsOptions );

                //check for icon name in init options
                if (!options.name) {
                    holder.addClass('livicon-evo-error').html('<span><acronym title="Please check the &quot;name&quot; option of your SVG LivIconEvo file.">Name Error</acronym></span>');
                    return;
                }
                if ( !options.name.match(/(\.svg)$/) ) {
                    options.name += '.svg';
                }

                //Convert string options to numbers and boolean where necessary
                for (var key in options) {
                    if ( options.hasOwnProperty(key) ) {
                        options[key] = strToNum(options[key]);
                        options[key] = strToBool(options[key]);
                    }
                }

                //add service options (do NOT pass them directly!)
                if ( options.name.match(/morph+(-)/) ) {
                    options.morph = true;
                } else {
                    options.morph = false;
                }
                options.drawOnce = false;
                options.drawn = false;
                options.ending = false;

                //Storing options as object assigned to initial element (div with class .livicon-evo for example)
                holder.removeData('savedOptions');
                holder.data('savedOptions', options);

                //execute beforeAdd callback function
                if (typeof options.beforeAdd === 'function') {
                    options.beforeAdd();
                }

                //load SVG icon file into a page and create LiviconEvo
                jQuery.ajax({
                    url: options.pathToFolder + options.name,
                    type: 'GET',
                    dataType: 'text',
                    global: true,
                    success: function (code) {
                        holder.removeClass('livicon-evo-error');

                        //make IDs unique
                        var arr = code.match(/(id=[\"'](.*?)[\"'])/gi);
                        if (!!arr) {
                            arr.forEach(function (ndx) {
                                ndx = ndx.replace(/id=[\"']/i, '').replace(/[\"']/, '');
                                var re = new RegExp(ndx, 'g');
                                code = code.replace( re, ndx +'_'+ uniqueNum() );
                            });
                        }

                        //creating Snap.Fragment
                        code = Snap.parse(code);

                        //adding result SVG code into the holder
                        var wrapper = holder.empty().append('<div>').children().addClass('lievo-svg-wrapper');
                        try {
                            wrapper[0].appendChild(code.node);
                        } catch (err) {
                            wrapper.html(code.node);
                        }

                        //creating LiviconEvo
                        createLiviconEvo (holder, options);

                        //execute afterAdd callback function
                        if (typeof options.afterAdd === 'function') {
                            options.afterAdd();
                        }
                    },
                    error: function(xhr, err){
                        holder.addClass('livicon-evo-error');
                        if (xhr.status === 0 && err === 'error') {
                            holder.html('<span><acronym title="Please use LivIconsEvo script on a working local or internet connected webserver, it does NOT work directly opened from a HDD.">Network Error</acronym></span>');
                            return;
                        } else if (xhr.status === 404 && err === 'error') {
                            holder.html('<span><acronym title="Please check the &quot;name&quot; option and/or default &quot;pathToFolder&quot; one where all SVG LivIconEvo files are placed.">Not Found</acronym></span>');
                            return;
                        } else {
                            holder.html('<span><acronym title="There is an unknown error. Please check for messages in Console (F12 key).">Unknown Error</acronym></span>');
                            return;
                        }
                    }
                });//end AJAX

            });//end return

        }, //end addLiviconEvo

        //the method for updating LiviconEvo with new (if any) passed options
        updateLiviconEvo: function (opt, val) {
            var jsOptions;
            if (arguments.length < 2) {
                if ( opt === Object(opt) ) {
                    jsOptions = opt;
                } else {
                    jsOptions = {};
                }
            } else {
                if ( opt === Object(opt) ) {
                    jsOptions = opt;
                } else {
                    jsOptions = {};
                    jsOptions[opt] = val;
                }
            }
            return this.each(function() {
                var holder = jQuery(this),
                    options = holder.data('savedOptions');

                //if previously created
                if (options) {

                    //Unbind previously attached events
                    if (options.eventElement) {
                        options.eventElement.off('.LiviconEvo');
                    }
                    options.eventElement = undefined;

                    //Clone options as a new object
                    options = cloneObj(options);
                    //combine options from saved and any new ones JavaScript passed
                    options = jQuery.extend( options, jsOptions );
                    if ( !options.name.match(/(\.svg)$/) ) {
                        options.name += '.svg';
                    }

                    //Convert string options to numbers and boolean where necessary
                    for (var key in options) {
                        if ( options.hasOwnProperty(key) ) {
                            options[key] = strToNum(options[key]);
                            options[key] = strToBool(options[key]);
                        }
                    }

                    //add inner options (do NOT pass them directly!)
                    if (options.name.match(/morph+(-)/)) {
                        options.morph = true;
                    } else {
                        options.morph = false;
                    }
                    options.drawOnce = false;
                    options.drawn = false;
                    options.ending = false;

                    //Storing options as object assigned to initial element (div for ex.)
                    holder.data('savedOptions', options);

                    //execute beforeUpdate callback function
                    if (typeof options.beforeUpdate === 'function') {
                        options.beforeUpdate();
                    }

                    //load SVG icon file into a page and create LiviconEvo
                    jQuery.ajax({
                        url: options.pathToFolder + options.name,
                        type: 'GET',
                        dataType: 'text',
                        global: true,
                        success: function (code) {
                            var arr,
                                wrapper;

                            holder.addClass('livicon-evo-holder').removeClass('livicon-evo-error');

                            //make IDs unique
                            arr = code.match(/(id=[\"'](.*?)[\"'])/gi);
                            if (!!arr) {
                                arr.forEach(function (ndx) {
                                    ndx = ndx.replace(/id=[\"']/i, '').replace(/[\"']/, '');
                                    var re = new RegExp(ndx, 'g');
                                    code = code.replace( re, ndx +'_'+ uniqueNum() );
                                });
                            }

                            //creating Snap.Fragment
                            code = Snap.parse(code);

                            //adding result SVG code into the holder
                            wrapper = holder.empty().append('<div>').children().addClass('lievo-svg-wrapper');
                            try {
                                wrapper[0].appendChild(code.node);
                            } catch (err) {
                                wrapper.html(code.node);
                            }

                            //creating LiviconEvo
                            createLiviconEvo (holder, options);

                            //execute afterUpdate callback function
                            if (typeof options.afterUpdate === 'function') {
                                options.afterUpdate();
                            }
                        },
                        error: function(xhr, err){
                            holder.addClass('livicon-evo-error');
                            if (xhr.status === 0 && err === 'error') {
                                holder.html('<span><acronym title="Please use LivIconsEvo script on a working local or internet connected webserver, it does NOT work directly opened from a HDD.">Network Error</acronym></span>');
                                return;
                            } else if (xhr.status === 404 && err === 'error') {
                                holder.html('<span><acronym title="Please check the &quot;name&quot; option and/or default &quot;pathToFolder&quot; one where all SVG LivIconEvo files are placed.">Not Found</acronym></span>');
                                return;
                            } else {
                                holder.html('<span><acronym title="There is an unknown error. Please check for messages in Console (F12 key).">Unknown Error</acronym></span>');
                                return;
                            }
                        }
                    }); //end AJAX

                } else { //first creation
                    holder.addLiviconEvo(jsOptions);
                }

            });//end return

        },//end updateLiviconEvo

        //the method for changing of LiviconEvo (through erase, update and draw)
        changeLiviconEvo: function (opt, val) {
            var jsOptions;
            if (arguments.length < 2) {
                if ( opt === Object(opt) ) {
                    jsOptions = opt;
                } else {
                    jsOptions = {};
                }
            } else {
                if ( opt === Object(opt) ) {
                    jsOptions = opt;
                } else {
                    jsOptions = {};
                    jsOptions[opt] = val;
                }
            }

            //Convert string options to numbers and boolean where necessary
            for (var key in jsOptions) {
                if ( jsOptions.hasOwnProperty(key) ) {
                    jsOptions[key] = strToNum(jsOptions[key]);
                    jsOptions[key] = strToBool(jsOptions[key]);
                }
            }

            return this.each(function() {
                var holder = jQuery(this),
                    data = holder.data(),
                    options = data.savedOptions;

                //if previously created
                if (options) {

                    var drawTL = data.drawTL,
                        mainTL = data.mainTL,
                        shapes = holder.find('circle, ellipse, line, path, polygon, polyline, rect');


                    //Unbind previously attached events
                    if (options.eventElement) {
                        options.eventElement.off('.LiviconEvo');
                    }
                    options.eventElement = undefined;

                    //Clone saved options as a new object
                    options = cloneObj(options);

                    //combine saved options and new ones JavaScript passed
                    options = jQuery.extend( options, jsOptions );

                    drawTL.pause().totalProgress(0).clear();
                    mainTL.pause().totalProgress(0);
                    options.drawn = true;
                    if (jsOptions.drawOnViewport === false) {
                        options.drawOnViewport = false;
                    } else {
                        options.drawOnViewport = true;
                    }

                    holder.eraseLiviconEvo(options);
                    var st = setTimeout(function(){
                        holder.updateLiviconEvo(options);
                        clearTimeout(st);
                        }, (options.eraseDelay + options.eraseTime + options.eraseStagger*shapes.length) * 1000
                    );

                } else {//first creation
                    holder.addLiviconEvo(jsOptions);
                }

            });//end return
        },//end changeLiviconEvo

        //the method for line drawing of LiviconEvo
        drawLiviconEvo: function (opt, val, force) {
            var jsOptions;
            if (arguments.length <= 1) {
                if ( opt === Object(opt) ) {
                    jsOptions = opt;
                } else {
                    jsOptions = {};
                    jsOptions.force = opt;
                }
            } else if (arguments.length === 2){
                if ( opt === Object(opt) ) {
                    jsOptions = opt;
                    jsOptions.force = val;
                } else {
                    jsOptions = {};
                    jsOptions[opt] = val;
                    if (!jsOptions.force) {
                        jsOptions.force = false;
                    }
                }
            } else {
                jsOptions = {};
                jsOptions[opt] = val;
                jsOptions.force = force;
            }

            //Convert string options to numbers and boolean where necessary
            for (var key in jsOptions) {
                if ( jsOptions.hasOwnProperty(key) ) {
                    jsOptions[key] = strToNum(jsOptions[key]);
                    jsOptions[key] = strToBool(jsOptions[key]);
                }
            }

            return this.each(function() {
                var holder = jQuery(this),
                    data = holder.data(),
                    options = data.savedOptions;

                if (options) {
                    var drawTL = data.drawTL,
                        mainTL = data.mainTL,
                        drawDelay = (jsOptions.drawDelay === 0 || jsOptions.drawDelay) ? jsOptions.drawDelay : options.drawDelay,
                        drawTime = (jsOptions.drawTime === 0 || jsOptions.drawTime) ? jsOptions.drawTime : options.drawTime,
                        drawStagger = (jsOptions.drawStagger === 0 || jsOptions.drawStagger) ? jsOptions.drawStagger : options.drawStagger,
                        drawStartPoint = jsOptions.drawStartPoint ? jsOptions.drawStartPoint : options.drawStartPoint,
                        drawColor = jsOptions.drawColor ? jsOptions.drawColor : options.drawColor,
                        drawColorTime = (jsOptions.drawColorTime === 0 || jsOptions.drawColorTime) ? jsOptions.drawColorTime : options.drawColorTime,
                        drawEase = jsOptions.drawEase ? jsOptions.drawEase : options.drawEase,
                        beforeDraw = jsOptions.beforeDraw ? jsOptions.beforeDraw : options.beforeDraw,
                        afterDraw = jsOptions.afterDraw ? jsOptions.afterDraw : options.afterDraw,
                        duringDraw = jsOptions.duringDraw ? jsOptions.duringDraw : options.duringDraw,
                        drawReversed = (typeof jsOptions.drawReversed !== 'undefined') ? jsOptions.drawReversed : options.drawReversed,
                        shapes = holder.find('circle, ellipse, line, path, polygon, polyline, rect').not('.lievo-morphpattern').not('.lievo-donotdraw').not('.lievo-nohovercolor').get();

                    //to prevent firing onUpdate callbacks before onStart ones
                    drawTL.eventCallback('onStart', null);
                    drawTL.eventCallback('onComplete', null);
                    drawTL.eventCallback('onUpdate', null);

                    if (drawDelay <= 0) {
                        drawDelay = 0.001;
                    }
                    if (drawTime <= 0) {
                        drawTime = 0.001;
                    }

                    if ( strToBool(jsOptions.force) ) {
                        drawTL.clear();
                        drawTL.pause().totalProgress(0);
                        mainTL.pause().totalProgress(0);
                        options.drawn = false;
                    }

                    if (!drawTL.isActive() && !mainTL.isActive() && !options.drawn) {

                        if (drawReversed) {
                            shapes.reverse();
                        }
                        if (options.morph && options.colorsWhenMorph) {
                            var snapShapes = Snap(holder.find('svg')[0]).selectAll('circle, ellipse, image, line, path, polygon, polyline, rect, text, use');
                            snapShapes.forEach(function(shape) {
                                shape.data('curFill', jQuery(shape.node).attr('fill'));
                                shape.data('curStroke', shape.attr('stroke'));
                                shape.data('curOpacity', shape.attr('opacity'));
                            });
                            var sameColor = Snap(holder.find('svg')[0]).select('.lievo-checkshift');
                            sameColor = sameColor.data('actionStroke');
                        }


                        var funcTweenStarts = function() {
                            var snapTarget = Snap(this.target);
                            if (isIE || isEdge) {
                                if (snapTarget.data('initStrokeLinecap').toLowerCase() === 'square') {
                                    TweenMax.set(this.target, {attr:{'stroke-linecap': 'round'}});
                                }
                                if (snapTarget.data('initStrokeLinejoin').toLowerCase() === 'miter') {
                                    TweenMax.set(this.target, {attr:{'stroke-linejoin': 'round'}});
                                }

                            }
                            if (drawColor !== 'same') {
                                TweenMax.set(this.target, {strokeOpacity: 1, stroke: drawColor});
                                if (snapTarget.data('curStroke') === 'none') {
                                    snapTarget.attr({'stroke-width': 1/options.scaleStrokeFactor});
                                }
                            } else {
                                TweenMax.set(this.target, {strokeOpacity: 1});
                                if (snapTarget.data('curStroke') === 'none') {
                                    snapTarget.attr({'stroke-width': 1/options.scaleStrokeFactor, stroke: snapTarget.data('curFill')});
                                }
                                if (options.style === 'solid' && snapTarget.hasClass('lievo-solidbg')) {
                                    if (options.morph && options.colorsWhenMorph && options.morphState === 'end') {
                                        if (sameColor) {
                                            snapTarget.attr({stroke: sameColor});
                                        } else {
                                            snapTarget.attr({stroke: options.solidColorAction});
                                        }
                                    } else {
                                        snapTarget.attr({stroke: options.solidColor});
                                    }
                                }
                            }
                        };

                        var funcTweenCompleted = function() {
                            var snapTarget = Snap(this.target);
                            if (isIE || isEdge) {
                                if (snapTarget.data('initStrokeLinecap').toLowerCase() === 'square') {
                                    TweenMax.set(this.target, {attr:{'stroke-linecap': 'square'}});
                                }
                                if (snapTarget.data('initStrokeLinejoin').toLowerCase() === 'miter') {
                                    TweenMax.set(this.target, {attr:{'stroke-linejoin': 'miter'}});
                                }
                            }
                            TweenMax.to(this.target, drawColorTime, {stroke: snapTarget.data('curStroke'), fillOpacity: 1});
                        };

                        var funcAllTweensCompleted = function() {
                            options.drawn = true;
                        };

                        //Clear to avoid conflicts with eraseLiviconEvo
                        drawTL.clear();

                        //add beforeDraw callback function
                        if (typeof beforeDraw === 'function') {
                            drawTL.eventCallback('onStart', beforeDraw);
                        }

                        //add duringDraw callback function
                        if (typeof duringDraw === 'function') {
                            drawTL.eventCallback('onUpdate', duringDraw);
                        }

                        //add afterDraw callback function
                        drawTL.eventCallback('onComplete', function () {
                            if (typeof afterDraw === 'function') {
                                afterDraw();
                            }
                            if (options.autoPlay) {
                                holder.playLiviconEvo();
                            }
                        });

                        drawTL.delay(drawDelay);
                        TweenMax.set(shapes, {strokeOpacity: 0, fillOpacity: 0});
                        holder.css('visibility', 'visible');

                        if (typeof drawEase === 'string') {
                            drawEase = parseEase(drawEase);
                        }

                        switch (drawStartPoint) {
                            case 'middle': {
                                //as always due to IE9+ we need a special decisions :-)
                                TweenMax.set(shapes, {drawSVG:"0% 100%"});
                                drawTL.staggerFrom(shapes, drawTime, {drawSVG:"50% 50%", ease: drawEase, onStart: funcTweenStarts, onComplete: funcTweenCompleted}, drawStagger, 0, funcAllTweensCompleted);
                                break;
                            }
                            case 'end': {
                                drawTL.staggerFromTo(shapes, drawTime, {drawSVG:"100% 100%"}, {drawSVG:"0% 100%", ease: drawEase, onStart: funcTweenStarts, onComplete: funcTweenCompleted}, drawStagger, 0, funcAllTweensCompleted);
                                break;
                            }
                            default: {// including 'start' value
                                drawTL.staggerFromTo(shapes, drawTime, {drawSVG:"0% 0%"}, {drawSVG:"0% 100%", ease: drawEase, onStart: funcTweenStarts, onComplete: funcTweenCompleted}, drawStagger, 0, funcAllTweensCompleted);
                            }
                        }
                        drawTL.restart(true);
                    }
                } else {
                    jsOptions.drawOnViewport = true;
                    holder.addLiviconEvo(jsOptions);
                }
            });//end return
        },//end drawLiviconEvo

        //the method for erasing (disappearing) of LiviconEvo
        eraseLiviconEvo: function (opt, val, force) {
            var jsOptions;
            if (arguments.length <= 1) {
                if ( opt === Object(opt) ) {
                    jsOptions = opt;
                } else {
                    jsOptions = {};
                    jsOptions.force = opt;
                }
            } else if (arguments.length === 2){
                if ( opt === Object(opt) ) {
                    jsOptions = opt;
                    jsOptions.force = val;
                } else {
                    jsOptions = {};
                    jsOptions[opt] = val;
                    if (!jsOptions.force) {
                        jsOptions.force = false;
                    }
                }
            } else {
                jsOptions = {};
                jsOptions[opt] = val;
                jsOptions.force = force;
            }

            //Convert string options to numbers and boolean where necessary
            for (var key in jsOptions) {
                if ( jsOptions.hasOwnProperty(key) ) {
                    jsOptions[key] = strToNum(jsOptions[key]);
                    jsOptions[key] = strToBool(jsOptions[key]);
                }
            }

            return this.each(function() {
                var holder = jQuery(this),
                    data = holder.data(),
                    options = data.savedOptions;

                if (options) {
                    var drawTL = data.drawTL,
                        mainTL = data.mainTL,
                        eraseDelay = (jsOptions.eraseDelay === 0 || jsOptions.eraseDelay) ? jsOptions.eraseDelay : options.eraseDelay,
                        eraseTime = (jsOptions.eraseTime === 0 || jsOptions.eraseTime) ? jsOptions.eraseTime : options.eraseTime,
                        eraseStagger = (jsOptions.eraseStagger === 0 || jsOptions.eraseStagger) ? jsOptions.eraseStagger : options.eraseStagger,
                        eraseStartPoint = jsOptions.eraseStartPoint ? jsOptions.eraseStartPoint : options.eraseStartPoint,
                        eraseEase = jsOptions.eraseEase ? jsOptions.eraseEase : options.eraseEase,
                        beforeErase = jsOptions.beforeErase ? jsOptions.beforeErase : options.beforeErase,
                        afterErase = jsOptions.afterErase ? jsOptions.afterErase : options.afterErase,
                        duringErase = jsOptions.duringErase ? jsOptions.duringErase : options.duringErase,
                        eraseReversed = (typeof jsOptions.eraseReversed !== 'undefined') ? jsOptions.eraseReversed : options.eraseReversed,
                        shapes = holder.find('circle, ellipse, line, path, polygon, polyline, rect').not('.lievo-donotdraw').not('.lievo-nohovercolor').get();

                    //to prevent firing onUpdate callbacks before onStart ones
                    if (eraseDelay <= 0) {
                        eraseDelay = 0.001;
                    }
                    drawTL.eventCallback('onStart', null);
                    drawTL.eventCallback('onComplete', null);
                    drawTL.eventCallback('onUpdate', null);

                    if ( strToBool(jsOptions.force) ) {
                        drawTL.clear();
                        drawTL.pause().totalProgress(0);
                        mainTL.pause().totalProgress(0);
                        options.drawn = true;
                    }

                    if (!drawTL.isActive() && !mainTL.isActive() && options.drawn) {
                        if (eraseReversed) {
                            shapes.reverse();
                        }

                        if (options.morph && options.colorsWhenMorph) {
                            var snapShapes = Snap(holder.find('svg')[0]).selectAll('circle, ellipse, image, line, path, polygon, polyline, rect, text, use');
                            snapShapes.forEach(function(shape) {
                                shape.data('curFill', jQuery(shape.node).attr('fill'));
                                shape.data('curStroke', shape.attr('stroke'));
                                shape.data('curOpacity', shape.attr('opacity'));
                            });
                        }

                        var funcTweenStarts = function() {
                            if (Snap(this.target).data('curStroke') === 'none') {
                                Snap(this.target).attr({'stroke-width': 1/options.scaleStrokeFactor, stroke: Snap(this.target).data('curFill')});
                            }
                            TweenMax.to(this.target, eraseTime, {fillOpacity: 0});
                        };

                        var funcTweenCompleted = function() {
                            TweenMax.set(this.target, {strokeOpacity: 0, fillOpacity: 0});
                            if (Snap(this.target).data('curStroke') === 'none') {
                                TweenMax.set(this.target, {'stroke-width': 0, stroke:'none'});
                            }
                        };

                        var funcAllTweensCompleted = function() {
                            options.drawn = false;
                        };

                        //Clear to avoid conflicts with drawLiviconEvo
                        drawTL.clear();

                        //add beforeErase callback function
                        if (typeof beforeErase === 'function') {
                            drawTL.eventCallback('onStart', beforeErase);
                        }

                        //add afterErase callback function
                        if (typeof afterErase === 'function') {
                            drawTL.eventCallback('onComplete', afterErase);
                        }

                        //add duringErase callback function
                        if (typeof duringErase === 'function') {
                            drawTL.eventCallback('onUpdate', duringErase);
                        }

                        if (typeof eraseEase === 'string') {
                            eraseEase = parseEase(eraseEase);
                        }

                        drawTL.delay(eraseDelay);
                        TweenMax.set(shapes, {strokeOpacity: 1, fillOpacity: 1});
                        holder.css('visibility', 'visible');

                        switch (eraseStartPoint) {
                            case 'middle': {
                                drawTL.staggerFromTo(shapes, eraseTime, {drawSVG:"0% 100%"}, {drawSVG:"50% 50%", ease: eraseEase, onStart: funcTweenStarts, onComplete: funcTweenCompleted}, eraseStagger, 0, funcAllTweensCompleted);
                                break;
                            }
                            case 'end': {
                                drawTL.staggerFromTo(shapes, eraseTime, {drawSVG:"0% 100%"}, {drawSVG:"100% 100%", ease: eraseEase, onStart: funcTweenStarts, onComplete: funcTweenCompleted}, eraseStagger, 0, funcAllTweensCompleted);
                                break;
                            }
                            default: {// including 'start' value
                                drawTL.staggerFromTo(shapes, eraseTime, {drawSVG:"0% 100%"}, {drawSVG:0, ease: eraseEase, onStart: funcTweenStarts, onComplete: funcTweenCompleted}, eraseStagger, 0, funcAllTweensCompleted);
                            }
                        }
                        drawTL.restart(true);
                    }
                } else {
                    holder.addLiviconEvo(jsOptions);
                }
            });//end return
        },//end eraseLiviconEvo

        //the method to animate LiviconEvo
        playLiviconEvo: function (opt, val, force) {
            var jsOptions;
            if (arguments.length <= 1) {
                if ( opt === Object(opt) ) {
                    jsOptions = opt;
                } else {
                    jsOptions = {};
                    jsOptions.force = opt;
                }
            } else if (arguments.length === 2){
                if ( opt === Object(opt) ) {
                    jsOptions = opt;
                    jsOptions.force = val;
                } else {
                    jsOptions = {};
                    jsOptions[opt] = val;
                    if (!jsOptions.force) {
                        jsOptions.force = false;
                    }
                }
            } else {
                jsOptions = {};
                jsOptions[opt] = val;
                jsOptions.force = force;
            }

            //Convert string options to numbers and boolean where necessary
            for (var key in jsOptions) {
                if ( jsOptions.hasOwnProperty(key) ) {
                    jsOptions[key] = strToNum(jsOptions[key]);
                    jsOptions[key] = strToBool(jsOptions[key]);
                }
            }

            return this.each(function() {
                var holder = jQuery(this),
                    data = holder.data(),
                    options = data.savedOptions,
                    nestedTLs,
                    prog;

                if (options) {
                    var drawTL = data.drawTL,
                        mainTL = data.mainTL,
                        duration = (jsOptions.duration === 0 || jsOptions.duration) ? jsOptions.duration : options.duration,
                        delay = (jsOptions.delay === 0 || jsOptions.delay) ? jsOptions.delay : options.delay,
                        repeat = (jsOptions.repeat === 0 || jsOptions.repeat) ? jsOptions.repeat : options.repeat,
                        repeatDelay = (jsOptions.repeatDelay === 0 || jsOptions.repeatDelay) ? jsOptions.repeatDelay : options.repeatDelay,
                        beforeAnim = jsOptions.beforeAnim ? jsOptions.beforeAnim : options.beforeAnim,
                        afterAnim = jsOptions.afterAnim ? jsOptions.afterAnim : options.afterAnim,
                        duringAnim = jsOptions.duringAnim ? jsOptions.duringAnim : options.duringAnim;

                    if (options.animated) {

                        if ( strToBool(jsOptions.force) ) {
                            drawTL.pause().totalProgress(1);
                            mainTL.pause().totalProgress(0);
                            options.drawn = true;
                        }

                        if (duration === 'default') {
                            duration = options.defaultDuration;
                        }
                        //getting icon's nested time-lines and adjust duration
                        nestedTLs = mainTL.getChildren(false, false, true);
                        nestedTLs.forEach(function (tl) {
                            tl.duration( duration );
                        });

                        //to prevent firing onUpdate callback before onStart one
                        if (delay <= 0) {
                            delay = 0.001;
                        }
                        mainTL.delay( delay );

                        if (repeat === 'default') {
                            repeat = options.defaultRepeat;
                        } else if (repeat === 'loop') {
                            repeat = -1;
                        }

                        if (repeatDelay === 'default') {
                            repeatDelay = options.defaultRepeatDelay;
                        }
                        //to prevent firing onUpdate callback before onStart one
                        if (repeatDelay <= 0) {
                            repeatDelay = 0.001;
                        }

                        if (!options.morph) { // not a morph icon

                            mainTL.repeat( repeat ).repeatDelay( repeatDelay );

                            //add beforeAnim callback function
                            if (typeof beforeAnim === 'function') {
                                mainTL.eventCallback("onStart", beforeAnim);
                            }

                            //add afterAnim callback function (only fired when not looped)
                            if (typeof afterAnim === 'function') {
                                if (repeat !== -1) {
                                    mainTL.eventCallback("onComplete", afterAnim);
                                }
                            }

                            //add duringAnim callback function
                            if (typeof duringAnim === 'function') {
                                mainTL.eventCallback("onUpdate", duringAnim);
                            }

                            if ( !drawTL.isActive() && !mainTL.isActive() && options.drawn) {
                                prog = mainTL.totalProgress();
                                if (mainTL.paused() && prog > 0 && prog < 1) {
                                    mainTL.resume();
                                } else {
                                    mainTL.restart(true);
                                    options.ending = true;
                                }
                            }

                        } else { //morph icon

                            //morph icons can't be repeated or looped
                            mainTL.repeat(0).repeatDelay(0);

                            //add beforeAnim callback function
                            if (typeof beforeAnim === 'function') {
                                mainTL.eventCallback("onStart", beforeAnim);
                            }

                            //add duringAnim callback function
                            if (typeof duringAnim === 'function') {
                                mainTL.eventCallback("onUpdate", duringAnim);
                            }

                            //add afterAnim callback function
                            mainTL.eventCallback("onComplete", function () {
                                if (options.morphState === 'end') {
                                    options.curMorphState = 'start';
                                } else {
                                    options.curMorphState = 'end';
                                }
                                if (typeof afterAnim === 'function') {
                                    afterAnim();
                                }
                            });
                            mainTL.eventCallback("onReverseComplete", function () {
                                if (options.morphState === 'end') {
                                    options.curMorphState = 'end';
                                } else {
                                    options.curMorphState = 'start';
                                }
                                if (typeof afterAnim === 'function') {
                                    afterAnim();
                                }
                            });

                            if ( !drawTL.isActive() && !mainTL.isActive() && options.drawn) {
                                prog = mainTL.progress();
                                if (prog === 0) {
                                    mainTL.restart(true);
                                } else if (mainTL.paused() && prog > 0 && prog < 1) {
                                    mainTL.resume();
                                } else {
                                    mainTL.pause().reverse(0);
                                }
                            }
                        }
                    }
                } else {
                    holder.addLiviconEvo(jsOptions);
                }
            });//end return
        },//end playLiviconEvo

        //the method to stop LiviconEvo
        stopLiviconEvo: function () {
            return this.each(function() {
                var holder = jQuery(this),
                    data = holder.data(),
                    options = data.savedOptions;
                if (options) {
                    var mainTL = data.mainTL;
                    if (!options.morph) {
                        mainTL.pause().totalProgress(0);
                        options.ending = false;
                    } else {
                        mainTL.pause().progress(0);
                    }
                } else {
                    holder.addLiviconEvo();
                }
            });
        },//end stopLiviconEvo

        //the method to pause LiviconEvo
        pauseLiviconEvo: function () {
            return this.each(function() {
                var mainTL = jQuery(this).data('mainTL');
                if (!!mainTL) {
                    mainTL.pause();
                }
            });
        },//end pauseLiviconEvo

        //the method to resume LiviconEvo
        resumeLiviconEvo: function () {
            return this.each(function() {
                var mainTL = jQuery(this).data('mainTL');
                if (!!mainTL) {
                    mainTL.resume();
                }
            });
        },//end resumeLiviconEvo

        //the method to remove LiviconEvo
        removeLiviconEvo: function(opt, val, total) {
            var jsOptions ;
            if (arguments.length <= 1) {
                if ( opt === Object(opt) ) {
                    jsOptions = opt;
                } else {
                    jsOptions = {};
                    jsOptions.total = opt;
                }
            } else if (arguments.length === 2){
                if ( opt === Object(opt) ) {
                    jsOptions = opt;
                    jsOptions.total = val;
                } else {
                    jsOptions = {};
                    jsOptions[opt] = val;
                    if (!jsOptions.total) {
                        jsOptions.total = false;
                    }
                }
            } else {
                jsOptions = {};
                jsOptions[opt] = val;
                jsOptions.total = total;
            }

            return this.each(function() {
                var holder = jQuery(this),
                    options = holder.data('savedOptions');

                if (options) {
                    var beforeRemove = jsOptions.beforeRemove ? jsOptions.beforeRemove : options.beforeRemove,
                        afterRemove = jsOptions.afterRemove ? jsOptions.afterRemove : options.afterRemove;

                    //Unbind previously attached events
                    if (options.eventElement) {
                        options.eventElement.off('.LiviconEvo');
                    }
                    options.eventElement = undefined;

                    //execute beforeRemove callback function
                    if (typeof beforeRemove === 'function') {
                        beforeRemove();
                    }

                    holder.removeData('savedOptions drawTL mainTL');

                    if ( strToBool(jsOptions.total) ) {
                        holder.remove();
                    } else {
                        holder.empty();
                    }

                    //execute afterRemove callback function
                    if (typeof afterRemove === 'function') {
                        afterRemove();
                    }
                }
            });//end return
        },//end removeLiviconEvo

        //the method to get/set current morph icon state
        //returns: 'start' or 'end' for morph icons
        liviconEvoState: function (setter) {
            if (arguments.length === 0) {
                return jQuery(this).data('savedOptions').curMorphState;
            } else if (arguments.length >= 1){
                return this.each(function() {
                    var holder = jQuery(this),
                        options = holder.data('savedOptions'),
                        mainTL = jQuery(this).data('mainTL');
                    if (setter.toLowerCase() === 'start') {
                        if (!!mainTL && options.morph) {
                            if (options.morphState === 'end') {
                                mainTL.pause().progress(1);
                            } else {
                                mainTL.pause().progress(0);
                            }
                            options.curMorphState = 'start';
                        }
                    } else if (setter.toLowerCase() === 'end') {
                        if (!!mainTL && options.morph) {
                            if (options.morphState === 'end') {
                                mainTL.pause().progress(0);
                            } else {
                                mainTL.pause().progress(1);
                            }
                            options.curMorphState = 'end';
                        }
                    }
                });
            }
        }, //end liviconEvoState

        //the method to get all the saved options
        liviconEvoOptions: function () {
            var options = jQuery(this).data('savedOptions'),
                temp;
            if (options) {
                temp = {};
                temp.afterAdd = options.afterAdd;
                temp.afterAnim = options.afterAnim;
                temp.afterDraw = options.afterDraw;
                temp.afterErase = options.afterErase;
                temp.afterRemove = options.afterRemove;
                temp.afterUpdate = options.afterUpdate;
                temp.allowMorphImageTransform = options.allowMorphImageTransform;
                temp.animated = options.animated;
                temp.autoPlay = options.autoPlay;
                temp.beforeAdd = options.beforeAdd;
                temp.beforeAnim = options.beforeAnim;
                temp.beforeDraw = options.beforeDraw;
                temp.beforeErase = options.beforeErase;
                temp.beforeRemove = options.beforeRemove;
                temp.beforeUpdate = options.beforeUpdate;
                temp.brightness = options.brightness;
                temp.colorsHoverTime = options.colorsHoverTime;
                temp.colorsOnHover = (options.colorsOnHover === false ? 'none' : options.colorsOnHover);
                temp.colorsWhenMorph = (options.colorsWhenMorph === false ? 'none' : options.colorsWhenMorph);
                temp.delay = (options.delay === 0.001 ? 0 : options.delay);
                temp.drawColor = options.drawColor;
                temp.drawColorTime = options.drawColorTime;
                temp.drawDelay = (options.drawDelay === 0.001 ? 0 : options.drawDelay);
                temp.drawEase = options.drawEase;
                temp.drawOnViewport = options.drawOnViewport;
                temp.drawReversed = options.drawReversed;
                temp.drawStagger = options.drawStagger;
                temp.drawStartPoint = options.drawStartPoint;
                temp.drawTime = options.drawTime;
                temp.duration = options.duration;
                temp.duringAnim = options.duringAnim;
                temp.duringDraw = options.duringDraw;
                temp.duringErase = options.duringErase;
                temp.eraseDelay = (options.eraseDelay === 0.001 ? 0 : options.eraseDelay);
                temp.eraseEase = options.eraseEase;
                temp.eraseReversed = options.eraseReversed;
                temp.eraseStagger = options.eraseStagger;
                temp.eraseStartPoint = options.eraseStartPoint;
                temp.eraseTime = options.eraseTime;
                temp.eventOn = options.eventOn;
                temp.eventType = (options.eventType === false ? 'none' : options.eventType);
                temp.fillColor = options.fillColor;
                temp.fillColorAction = options.fillColorAction;
                temp.flipHorizontal = options.flipHorizontal;
                temp.flipVertical = options.flipVertical;
                temp.keepStrokeWidthOnResize = options.keepStrokeWidthOnResize;
                temp.morphImage = (options.morphImage === false ? 'none' : options.morphImage);
                temp.morphState = options.morphState;
                temp.name = options.name;
                temp.pathToFolder = options.pathToFolder;
                temp.repeat = options.repeat;
                temp.repeatDelay = options.repeatDelay;
                temp.rotate = (options.rotate === false ? 'none' : options.rotate);
                temp.saturation = options.saturation;
                temp.size = options.size;
                temp.solidColor = options.solidColor;
                temp.solidColorAction = options.solidColorAction;
                temp.solidColorBg = options.solidColorBg;
                temp.solidColorBgAction = options.solidColorBgAction;
                temp.strokeColor = options.strokeColor;
                temp.strokeColorAction = options.strokeColorAction;
                temp.strokeColorAlt = options.strokeColorAlt;
                temp.strokeColorAltAction = options.strokeColorAltAction;
                temp.strokeStyle = options.strokeStyle;
                temp.strokeWidth = options.strokeWidth;
                temp.strokeWidthFactorOnHover = (options.strokeWidthFactorOnHover === false ? 'none' : options.strokeWidthFactorOnHover);
                temp.strokeWidthOnHoverTime = options.strokeWidthOnHoverTime;
                temp.style = options.style;
                temp.touchEvents = options.touchEvents;
                temp.tryToSharpen = options.tryToSharpen;
                temp.viewportShift = (options.viewportShift === false ? 'none' : options.viewportShift);
                temp.defaultDuration = options.defaultDuration;
                temp.defaultRepeat = options.defaultRepeat;
                temp.defaultRepeatDelay = options.defaultRepeatDelay;
                return temp;
            } else {
                return undefined;
            }
        }//end liviconEvoOptions


    });//end jQuery plugin

    //add LivIcons Evolution to elements with default class .livicon-evo
    jQuery(document).ready(function() {
        jQuery('.livicon-evo').addLiviconEvo();
    });

    //bug-fix for some mobile devices
    jQuery(window).on('orientationchange', function(){
        jQuery(window).resize();
    });

    /*******Helper functions******/
    //unique number from 1
    uniqueNum.counter = 1;
    function uniqueNum () {
        return uniqueNum.counter++;
    }

    // function for cloning object
    function cloneObj(obj){
        if(obj === null || typeof(obj) !== 'object') {
            return obj;
        }
        var temp = new obj.constructor();
        for(var key in obj) {
            if ( obj.hasOwnProperty(key) ) {
                temp[key] = cloneObj(obj[key]);
            }
        }
        return temp;
    }

    // converts string to boolean
    function strToBool(str) {
        if (typeof str === 'string' || str instanceof String) {
            var lowerCaseStr = str.toLowerCase();
            switch (lowerCaseStr) {
                case 'true':
                case 'yes': {
                    return true;
                }
                case 'false':
                case 'no':
                case 'none': {
                    return false;
                }
                default: {
                    return str;
                }
            }
        } else {
            return str;
        }
    }

    // converts string to number
    function strToNum(str) {
        if (typeof str === 'string' || str instanceof String) {
            if ( (+str) || str === '0' ) {
                return +str;
            } else {
                return str;
            }
        } else {
            return str;
        }
    }

    //parse ease string and return an Object
    function parseEase(string) {
        var easing = string.split(".");
        if (easing.length === 2 && easing[0] !== 'SteppedEase') {
            if (isWP) {
                return window.DeeThemes_GS[easing[0]][easing[1]];
            }
            return window[easing[0]][easing[1]];
        }
        var cfgExp = /true|false|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/ig;
        var config = string.match(cfgExp).map(JSON.parse);
        if (easing[0] !== 'SteppedEase') {
            if (isWP) {
                return window.DeeThemes_GS[easing[0]][easing[1]].config.apply(null, config);
            }
            return window[easing[0]][easing[1]].config.apply(null, config);
        } else {
            if (isWP) {
                return window.DeeThemes_GS[easing[0]].config.apply(null, config);
            }
            return window[easing[0]].config.apply(null, config);
        }
    }

    //Calculates lighter or darker color
    function LighterDarker(color,ds,dv) {
        var init = Snap.color(color),
            c = Snap.rgb2hsb(init.r, init.g, init.b);
        c.s = c.s + ds;
        if (c.s < 0) {
            c.s = 0;
        }
        if (c.s > 1) {
            c.s = 1;
        }
        c.b = c.b + dv;
        if (c.b < 0) {
            c.b = 0;
        }
        if (c.b > 1) {
            c.b = 1;
        }
        return Snap.hsb(c.h, c.s, c.b);
    }

    //Calculates hue rotation
    function hueRotate(color,deg) {
        var init = Snap.color(color),
            c = Snap.rgb2hsb(init.r, init.g, init.b);
        deg = Math.abs(deg) / 360 % 1;
        c.h = (c.h + deg) % 1;
        return Snap.hsb(c.h, c.s, c.b);
    }

})(window.jQuery); //end of anonymous func