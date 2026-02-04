
    function ValidateForm(myform){
        var dt=myform.newvalue
        if (isDate(dt.value)==false){
            dt.focus()
            return false
        }
        return true
     }
    function ValidateStatus(myform){
        var dt=myform.notes
        var mytype=myform.action
        if ( ( mytype.value == 'pausexxxxx' ) && ( dt.value == '' || dt.value == '(optional reason)' ) ){
            alert('Please enter a brief explanation for your status change.');
            dt.focus()
            return false
        }
        else if( mytype.value == 'delete' ) { return confirm('Are you sure you want to delete this job?'); }
        else if( mytype.value == 'deleteother' ) { return confirm('**** This job was created by someone else. **** Are you certain you want to delete this job?'); }
        else {return true; }
     }

    $(document).ready(function(){

        $('.buttonspinner').click(function() {
            var st = $(this).attr('spinnertext');
            if( st ) { $('#spinner-text').text(st); }
            $('#spinner').show();
        });

        $("#spinner").bind("ajaxSend", function() {
            var st = $(this).attr('spinnertext');
            if( st ) { $('#spinner-text').text(st); }
            $('#spinner').show();
        }).bind("ajaxStop", function() {
            $(this).hide();
        }).bind("ajaxSuccess", function() {
            $(this).hide();
        }).bind("ajaxComplete", function() {
            $(this).hide();
        }).bind("ajaxError", function() {
            $(this).hide();
        });

        //insert options
        $("#paper").change(function() {
            var pc = $(this).find(":selected").val();

            if ( pc == 'CHECKSTOCK' ) {
                $('#inkcolor').val('BW').hide();
                $('#inkdiv').text( $('#inkcolor').find(':selected').text() + ' MICR Toner' ).show();
                $('#papersize').val('85x11').hide();
                $('#papersizediv').text( $('#papersize').find(':selected').text() ).show();
                $('#duplex').val('S').hide();
                $('#duplexdiv').text( $('#duplex').find(':selected').text() ).show();
            }
            else if ( pc == 'PERF23' || pc == 'PERFCP' ) {
                $('#papersize').val('85x11').hide();
                $('#papersizediv').text( $('#papersize').find(':selected').text() ).show();
                $('#inkdiv').text('');
                $('#inkcolor').show();
                $('#duplexdiv').text('');
                $('#duplex').show();
            }
            else {
                $('#inkdiv').text('');
                $('#inkcolor').show();
                $('#papersizediv').text('');
                $('#papersize').show();
                $('#duplexdiv').text('');
                $('#duplex').show();
            }
        });

        $(".pager, .abookpager").live( 'click', function (e) {
            e.preventDefault();
            var theclass = ($(this).hasClass('pager'))?'pager':'abookpager';
            var type = $(this).attr('type');
            var group = $(this).attr('group');
            var page = $(this).attr('page');
            var sort = $(this).attr('sort');
            var sortorder = $(this).attr('sortorder');
            var $this = $(this);

            $.ajax({
                type: "POST",
                data: ({'ajax' : 'true', 'action' : theclass, 'type' : type, 'page' : page, 'group' : group, 'sort' : sort, 'sortorder' : sortorder}),
                success: function(table){
                    if( group ) {
                        $('.'+type+'_ps').removeClass('pager-selected '+type+'_ps');
                    }
                    $this.addClass(type+'_ps pager-selected');
                    $('#'+type).replaceWith(table);
                    $('#'+type).find(".tooltip").tooltip({
                        track: true,
                        showURL: false,
                        showBody: "//",
                        opacity: 0.9,
                        delay: 0
                    });

                }
            });
        });

        $(".select_recip").live( 'click', function (e) {
            var id = $(this).val();
            var theclass = $(this).attr('class');
            var chkd = 'unset';
            if( $(this).attr('checked') ) { chkd = 'set'; }

            $.ajax({
                type: "POST",
                data: ({'ajax' : 'true', 'action' : theclass, 'id' : id, 'checked' : chkd}),
                success: function(msg){
                    $('#selected-recipient-count').text(msg);
                },
                error: function(msg){
                    $(this).attr('checked', false);
                    alert('Sorry, there was a problem communicating with the server. Your last selection may not have been saved');
                }
            });
        });
        $(".select_recip_all").live( 'click', function (e) {

            var chkd = 'unset';
            if( $(this).attr('checked') ) { chkd = 'set'; }

            $(".select_recip").each(function(){
                var id = $(this).val();
                var theclass = $(this).attr('class');
                if( chkd == 'set' ) { $(this).attr('checked',true); }
                else { $(this).attr('checked',false); }
                $.ajax({
                    type: "POST",
                    data: ({'ajax' : 'true', 'action' : theclass, 'id' : id, 'checked' : chkd}),
                    success: function(msg){
                        $('#selected-recipient-count').text(msg);
                    },
                    error: function(msg){
                        $(this).attr('checked', false);
                        alert('Sorry, there was a problem communicating with the server. Your last selection may not have been saved');
                    }
                });
            });
        });

        $(".jobopts").live( 'click', function () {
            var type = $(this).attr('type');
            var button = type;
            if( type == 'deleteother' ) { button = 'delete'; }
            else if( type == 'shredother' ) { button = 'shred'; }
            var id = $(this).attr('jobid');
            var prev = $(this).attr('prev');
            var newdefault = $(this).attr('newdefault');
            var xtra = '';
            if( ! newdefault ) { newdefault = prev; }
            var form = '';
            if( type == 'edit_schddate' ) { xtra = 'onSubmit="return ValidateForm(this)"'; }

            if( type == 'pause' || type == 'resume' || type == 'delete' || type == 'deleteother' || type == 'shred' || type == 'shredother' ) {
                xtra = 'onSubmit="return ValidateStatus(this)"';
                form = '<div class="jobedit_form"><form method="post" '+xtra+' >'+
                        '<input type="hidden" name="jobid" value="'+id+'">'+
                        '<input type="hidden" name="action" value="'+type+'">'+
                        '<textarea name="notes" onfocus="if(this.value==\'(optional reason)\') this.value=\'\';">(optional reason)</textarea>'+
                        '<input type="submit" value="'+button+' job"></form></div>';
            }
            else if( type == 'notifyproof' ) {
                form = '<div class="jobedit_form"><span style="font-size: 10px;">'+
                        'If you would like us to notify others about the status '+
                        'of this job, enter their email addresses below'+
                        ' (seperated by commas) and click the save button.'+
                        '</span><br>'+
                        '<form method="post" '+xtra+' >'+
                        '<input type="hidden" name="jobid" value="'+id+'">'+
                        '<input type="hidden" name="action" value="'+type+'">'+
                        '<textarea name="notes">'+newdefault+'</textarea><br>'+
                        '<input type="checkbox" name="sendproof" value="1">'+
                        '<span style="font-size: 9px;">Check this box to send '+
                        'notice to these recipients that this job is ready for their review.</span>'+
                        '<input type="submit" value="Save"></form></div>';
            }
            else {
                form = '<div class="jobedit_form"><form method="post" '+xtra+'>'+
                        '<input type="hidden" name="jobid" value="'+id+'">'+
                        '<input type="hidden" name="action" value="'+type+'">'+
                        '<input type="hidden" name="prevvalue" value="'+prev+'">'+
                        '<input type="text" name="newvalue" value="'+newdefault+'">'+
                        '<input type="submit" value="submit change"></form></div>';
            }

            $('.jobedit_form').hide();

            if( $(this).next('.jobedit_form').length > 0 ) {
                $(this).next('.jobedit_form').show();
            }
            else {
                $(this).after(form);
            }
        });

        $('.tooltip').tooltip({
            track: true,
            showURL: false,
            showBody: "//",
            opacity: 0.9,
            delay: 0
        });

        $(".certified_mail_tracking, .trackinginfo").live('click', function(e) {
            e.preventDefault();

            var tid;
            var jobid;
            var item;
            if( tid = $(this).prev('#trackingid').val() ) { item = $(this).prev('#trackingid'); }
            else if( tid = $('#trackingid').val() ) { item = $('#trackingid'); }
            else if ( tid = $(this).attr('id') ) {}

            jobid = $(this).attr('jobid')

            if( tid ) {

                if( tid.substr(0,1) == 'R' ) {
                    if ( tid.length != 13 ) {
                        alert("Please enter a valid tracking number\n" + tid);
                        if( item ) { item.val('').focus(); }
                        if( $('#trackinginfo') ) { $('#trackinginfo').html('<p>Please enter a valid tracking number.</p><p>Valid numbers contain 20 digits and typically look like this:</p><p>7000 0000 0000 0000 0000</p>'); }
                        return false;
                    }
                }
                else if( tid.substr(0,2) == '92' ) {
                    if ( tid.length != 22 && tid.length != 23 ) {
                        alert("Please enter a valid tracking number\n" + tid);
                        if( item ) { item.val('').focus(); }
                        if( $('#trackinginfo') ) { $('#trackinginfo').html('<p>Please enter a valid tracking number.</p><p>Valid numbers contain 20 or 22 digits and typically look like this:</p><p>7000 0000 0000 0000 0000 or 9200 0000 0000 0000 0000 00</p>'); }
                        return false;
                    }
                }
                else if( tid.substr(0,2) == '95' ) {
                    if ( tid.length != 22 && tid.length != 23 ) {
                        alert("Please enter a valid tracking number\n" + tid);
                        if( item ) { item.val('').focus(); }
                        if( $('#trackinginfo') ) { $('#trackinginfo').html('<p>Please enter a valid tracking number.</p><p>Valid numbers contain 20 or 22 digits and typically look like this:</p><p>7000 0000 0000 0000 0000 or 9200 0000 0000 0000 0000 00</p>'); }
                        return false;
                    }
                }
                else{
                    tid = tid.replace(/\s+|\D+/g, '');
                    tid = tid.substr( 0,20);
                    if ( tid.length != 20 ) {
                        alert("Please enter a valid tracking number\n" + tid);
                        if( item ) { item.val('').focus(); }
                        if( $('#trackinginfo') ) { $('#trackinginfo').html('<p>Please enter a valid tracking number.</p><p>Valid numbers contain 20 digits and typically look like this:</p><p>7000 0000 0000 0000 0000</p>'); }
                        return false;
                    }
                }
            }

            var skipheader = 0;
            if( $('.modalcontent').length ) { skipheader = 1; }

            $.ajax({
                ajaxStart: $('.modalcontent').html('loading...'),
                type: "GET",
                url: "/uspstracking.php",
                data: ({'ajax' : 'true', 'trackingid' : tid, 'jobid' : jobid, 'skipheader': skipheader}),
                success: function(msg){
                    if( skipheader == 1 ) {
                        $('.modalcontent').html(msg);
                    }
                    else {
                        $.modal(msg,{overlayClose:true,containerCss:{height:"80%"}});
                    }
                }
            });
        });

        //$(".genericmodal").live('click', function(e) {
        $( document ).on( 'click', ".genericmodal", function(e) {
            e.preventDefault();
            var action = $(this).attr('action');
            var id = $(this).attr('id');
            var rid = $(this).attr('record');
            var grpid = $(this).attr('grpid');
            var mw = $(this).attr('mw');
            var mh = $(this).attr('mh');
            if( ! mw ) { mw = 800; }
            if( ! mh ) { mh = 400; }
            $.ajax({
                type: "POST",
                data: ({'action' : action, 'id' : id, 'record': rid, 'grpid': grpid}),
                success: function(msg){
                    $.modal(
                        msg,{
                            overlayClose:true,
                            containerCss:{height:"80%"},
                            minHeight:400,
                            onShow: function () {
                                $('.generictt').find(".tooltip").tooltip({
                                    track: true,
                                    showURL: false,
                                    showBody: "//",
                                    opacity: 0.9,
                                    delay: 0
                                });
                            }
                        }
                    );

                }
            });
        });



        $(".blur").live('click', function(e) {
            e.preventDefault();
        });
        $(".blur").live('focus', function(e) {
            e.preventDefault();
            this.blur();
        });

        $(".recipdelete").live('click', function(e) {
            e.preventDefault();
            var jobid = $(this).attr('jobid');
            var rid = $(this).attr('rid');
            var deletedqty = $('.deletedqty:first').text();
            var newdeletedqty = parseInt(deletedqty)+1;
            var activeqty = $('.activeqty:first').text();
            var therow = $('#'+rid+'_row');
            delrec(jobid,rid,deletedqty,newdeletedqty,activeqty,therow);
        });
        $(".pagedelete").live('click', function(e) {
            e.preventDefault();

            $(".recipdelete").each(function(){
                var jobid = $(this).attr('jobid');
                var rid = $(this).attr('rid');
                var deletedqty = $('.deletedqty').text();
                var newdeletedqty = parseInt(deletedqty)+1;
                var activeqty = $('.activeqty').text();
                var therow = $('#'+rid+'_row');
                delrec(jobid,rid,deletedqty,newdeletedqty,activeqty,therow);
            });

            var type = 'active';

            $.ajax({
                type: "POST",
                data: ({'ajax' : 'true', 'action' : 'pager', 'type' : type}),
                success: function(table){
                    $('#'+type).replaceWith(table);
                    $('#'+type).find(".tooltip").tooltip({
                        track: true,
                        showURL: false,
                        showBody: "//",
                        opacity: 0.9,
                        delay: 0
                    });

                }
            });
        });

        function delrec(jobid,rid,deletedqty,newdeletedqty,activeqty,therow) {
            $.ajax({
                type: "POST",
                data: ({'ajax' : 'true', action : 'ajax_delete_recipient', 'rid' : rid, 'jobid' : jobid}),
                success: function(msg){
                    if( msg ) {
                        if( newdeletedqty > 10 ) {
                            var type = 'deleted';

                            $.ajax({
                                type: "POST",
                                data: ({'ajax' : 'true', 'action' : 'pager', 'type' : type, 'page' : Math.ceil(newdeletedqty/10)}),
                                success: function(table){
                                    $('#'+type).replaceWith(table);
                                    $('#'+type).find(".tooltip").tooltip({
                                        track: true,
                                        showURL: false,
                                        showBody: "//",
                                        opacity: 0.9,
                                        delay: 0
                                    });

                                }
                            });
                        }
                        else {
                            var newrow = $('#'+rid+'_row').clone();
                            newrow.appendTo('#deleted table').addClass('deleted');
                            newrow.find('.recipdelete').removeClass('recipdelete').addClass('recipresume').text('restore');
                        }
                        therow.replaceWith('<tr id="'+rid+'_original" class="deleted"><td colspan="10">successfully moved to deleted recipients list below</td></tr>');
                        $('#'+rid+'_original').delay(800).fadeOut(400);
                        $('.activeqty').text(parseInt(activeqty)-1)
                        $('.deletedqty').text(parseInt(deletedqty)+1)

                        if( parseInt(activeqty)-1 == 0 ) { $('#continue').hide(); }

                    }
                }
            });
        }
        $(".recipresume").live('click', function(e) {
            e.preventDefault();
            var jobid = $(this).attr('jobid');
            var rid = $(this).attr('rid');
            var deletedqty = $('.deletedqty:first').text();
            var activeqty = $('.activeqty:first').text();
            var therow = $('#'+rid+'_row');
            $.ajax({
                type: "POST",
                data: ({'ajax' : 'true', action : 'ajax_resume_recipient', 'rid' : rid, 'jobid' : jobid}),
                success: function(msg){
                    if( msg ) {
                        if( true ) {
                            var type = 'active';

                            $.ajax({
                                type: "POST",
                                data: ({'ajax' : 'true', 'action' : 'pager', 'type' : type}),
                                success: function(table){
                                    $('#'+type).replaceWith(table);
                                    $('#'+type).find(".tooltip").tooltip({
                                        track: true,
                                        showURL: false,
                                        showBody: "//",
                                        opacity: 0.9,
                                        delay: 0
                                    });

                                }
                            });
                        }
                        else {
                            var newrow = $('#'+rid+'_row').clone();
                            $('#'+rid+'_original').replaceWith(newrow);
                            newrow.removeClass('deleted').find('.recipresume').removeClass('recipresume').addClass('recipdelete').text('delete');
                        }
                        therow.replaceWith('<tr id="'+rid+'_fadeout"><td colspan="6">recipient successfully added back to active recipients</td></tr>');
                        $('#'+rid+'_fadeout').delay(800).fadeOut(400).attr('id','');
                        $('.activeqty').text(parseInt(activeqty)+1)
                        $('.deletedqty').text(parseInt(deletedqty)-1)
                        if( parseInt(activeqty)+1 > 0 ) { $('#continue').show(); }
                    }
                }
            });
        });

        $(".showmedia").live('click', function(e) {
            e.preventDefault();

            var mytext = $(this).text();

            $(this).ajaxStop(function(){
                $(this).text(mytext);
            });
            $.ajax({
                ajaxStart: $(this).text('loading...'),
                type: "GET",
                url: "/ls/help.php",
                data: ({'ajax' : 'true', action:'showmedia',item : this.getAttribute('item')}),
                success: function(msg){
                    $.modal(msg,
                        {
                        overlayClose:true,
                        overlayId: 'showmedia-overlay',
                        containerId: 'showmedia-container'
                        }
                    );
                }
            });
        });

        $(".jobstart").click(function(e){
            window.location.href = "login.php";
        });

        $(window).scroll(function () {
            var msok = 1;
            if ( $.browser.msie ) {
                var version=parseFloat($.browser.version);
                if ( version < 8 ) { msok = 0 }
            }
            if( navigator.userAgent.match(/Android/i) ||
                navigator.userAgent.match(/webOS/i) ||
                navigator.userAgent.match(/iPhone/i) ||
                navigator.userAgent.match(/iPod/i)
                ) { msok = 0; }
            if( $(document).scrollTop() > 74 && msok ) {
                /*$(".navspacer").css( {"display":"block"} );
                $("#navlogout").css( {"display":"block"} );
                $("#topofpage").css( {"display":"block"} );
                $(".nav").css( {"position":"fixed"} );*/
            }
            else {
                /*$(".navspacer").css( {"display":"none"} );
                $("#navlogout").css( {"display":"none"} );
                $("#topofpage").css( {"display":"none"} );
                $(".nav").css( {"position":"relative"} );*/
            }
        });

        $("#topofpage").click(function() {
            $("html, body").animate({ scrollTop: 0 }, "slow");
            return false;
        });
        //end subnav/////////////////////////////////////////

        //begin menus/////////////////////////////////////////
        var timeout    = 200;
        var closetimer = 0;
        var ddnavitem = 0;
        var ddmenuitem = 0;

        function jsddm_open() {
            jsddm_canceltimer();
            jsddm_close();
            if( ! $(this).hasClass('activetab') ) { ddnavitem = $(this).addClass('over'); }
            ddmenuitem = $(this).find('ul').css('visibility', 'visible');
        }

        function jsddm_close() {
            if(ddnavitem) ddnavitem.removeClass('over');
            if(ddmenuitem) ddmenuitem.css('visibility', 'hidden');
        }

        function jsddm_timer() {
            closetimer = window.setTimeout(jsddm_close, timeout);
        }

        function jsddm_canceltimer() {
            if(closetimer) {
                window.clearTimeout(closetimer);
                closetimer = null;
            }
        }

        document.onclick = jsddm_close;

        $(window).scroll(jsddm_close);

        $('#jsddm > li').bind('mouseover', jsddm_open);
        $('#jsddm > li').bind('mouseout',  jsddm_timer);
        //end menus/////////////////////////////////////////

        var jobedit = 0;
        var jobedit_id = 0;
        var jobedit_item = 0;
        var jobedit_menu = 0;
        var jobedit_active = 0;
        function jobedit_open() {
            if( jobedit_active ) {
                if( $(this) != jobedit_active ) {
                    jobedit_close();
                }
            }

            if( jobedit_active == 0 ) {
                jobedit = $(this);
                jobedit_id = $(this).attr('jobeditid');
                jobedit_item = $(this).addClass('jobeditover');
                jobedit_menu = $('#jobedit'+jobedit_id).show();
                jobedit_active = jobedit;
            }
        }
        function jobedit_close() {
            if(jobedit_item) jobedit_item.removeClass('jobeditover');
            if(jobedit_menu) $('#jobedit'+jobedit_id).hide();
            jobedit_active = 0;
        }

        $('.jobedit').live('click', jobedit_open);
        $('.jobeditclose').live('click', jobedit_close);

        $(".filepreview").live('click', function(e) {
            e.preventDefault();

            var loc = $(this).attr('href');
            var type = $(this).attr('type');
            if( ! type ) { type = 'application/pdf'; }

            var thepreview = '<div><span style="font-size: 9px;">Trouble viewing? <a href="'+loc+'" target="_new">Click Here</a></span><br><embed id="filepreview" src="'+loc+'" width="700" height="700" type="'+type+'" /></div>';
            $.modal(thepreview,{
                overlayClose:true,
                containerCss:{
                    height:700,
                    width:700
                }
            });
            $('#proofviewed').val(1);
            $('#reviewproofwarning').css({"color":"#777777","font-weight":"normal"});
        });
        $(".imagepreview").live('click', function(e) {
            e.preventDefault();

            var loc = $(this).attr('href');

            var thepreview = '<div style="width: 700px;height: 700px; overflow: auto;"><img src="'+loc+'" style="max-width: 640px;max-height: 600px;" /></div>';
            $.modal(thepreview,{
                overlayClose:true,
                containerCss:{
                    height:700,
                    width:700
                }
            });

        });

        var lastBoxChecked = '';
        $('.chkbox').click(function(event) {
            if(!lastBoxChecked) {
                lastBoxChecked = this;
                return;
            }
            if(event.shiftKey) {
                var start = $('.chkbox').index(this);
                var end = $('.chkbox').index(lastBoxChecked);
                for(i=Math.min(start,end);i<=Math.max(start,end);i++) {
                    $('.chkbox')[i].checked = lastBoxChecked.checked;
                }
            }
            lastBoxChecked = this;
        });

        var z = '';
        var t = '';
        var tstop = false;
        $( ".selector" ).bind( "sortstart", function(event, ui) {
            tmo(t,z);
        });
        $(".thumbnail").live('mouseover', function(e) {
                t = $(this);
                z = $(this).css('z-index');
                $(this).css('z-index',99);
            }).live('mouseout', function(e) {
                tmo(t,z);
        });
        function tmo ( theselector, thez ) {
            theselector.css('z-index',thez);
        }
    });