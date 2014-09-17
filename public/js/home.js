var red = "red",
    green = "rgb(27,242,0)",
    orange = "orange";
String.prototype.toHHMMSS = function() {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = hours + ':' + minutes + ':' + seconds;
    return time;
}

function plot() {

    var now = new Date().getTime();

    var bound = parseFloat($("#bounds").val());

    var min = new Date(now).setHours(new Date(now).getHours() + bound);

    console.log(now, min);

    $.getJSON("/api/temps/" + min + "/", function(d) {
        $.plot("#plot", [d], {
            xaxis: {
                mode: "time",
                timezone: "browser",
                min: min,
                max: now
            },
            series: {
                lines: {
                    show: true
                },
                points: {
                    show: true
                }
            }
        });
    });
    $.getJSON("/api/cpu/" + min + "/", function(d) {
        $.plot("#cpu", d, {
            xaxis: {
                mode: "time",
                timezone: "browser",
                min: min,
                max: now
            },
            yaxes: [{
                //[First axis]
                //leave this empty, if there`s nothing to configure
            }, {
                //[Second axis]
                position: "right" //set this axis to appear on the right of chart
            }],
            series: {
                lines: {
                    show: true
                },
                points: {
                    show: true
                }
            }
        });
    });
    /*$.getJSON("/api/totalGraph", function(d) {
        $.plot("#his", d, {
            xaxis: {
                mode: "time",
                min: min,
                max: now
            },
            series: {
                lines: {
                    show: true
                },
                points: {
                    show: true
                }
            }
        });
    });*/
    $.getJSON("/api/lights/" + min + "/", function(d) {
        $.plot("#lLights", [d], {
            xaxis: {
                mode: "time",
                timezone: "browser",
                min: min,
                max: now
            },
            series: {
                lines: {
                    show: true
                },
                points: {
                    show: true
                }
            }
        });
    });
}

function brandOption(id, brand) {

    var ret = "<select id=\"configsFrom-" + id + "-brand\">";
    if (brand === "elro") {
        ret += "<option selected>Elro</option>";
    } else {
        ret += "<option>Elro</option>";
    }
    if (brand === "action") {
        ret += "<option selected>Action</option>";
    } else {
        ret += "<option>Action</option>";
    }
    ret += "</select>"
    return ret;

}
$(document).ready(function() {
    function letsGo() {
        timezoneJS.timezone.zoneFileBasePath = "/js/tz";
        timezoneJS.timezone.defaultZoneFile = "europe";
        timezoneJS.timezone.init({
            async: false
        });

        $("#bounds").change(function() {
            plot();
        });

        var dataPerDate = {};

        $.getJSON("/api/sleep", function(data) {

            var htmlForSleep = '<table class="table" style="color: white;"><thead><tr><th style="width: 15%;">Dag</th><th>Slaap</th></tr></thead>';



            $.each(data, function(x, y) {
                lengthSleep = y.end - y.begin;

                var beginDate = new Date(y.begin);

                if (dataPerDate[beginDate.getDate() + "-" + beginDate.getMonth() + "-" + beginDate.getFullYear()] == undefined) {
                    dataPerDate[beginDate.getDate() + "-" + beginDate.getMonth() + "-" + beginDate.getFullYear()] = [];
                }
                if (lengthSleep > (1000 * 60 * 10))
                    dataPerDate[beginDate.getDate() + "-" + beginDate.getMonth() + "-" + beginDate.getFullYear()].push({
                        "begin": y.begin,
                        "end": y.end,
                        "len": lengthSleep
                    });

                //htmlForSleep = htmlForSleep + '<div class="sleepTimeDay">' + ("" + lengthSleep / 1000 + "").toHHMMSS() + '</div>';

                console.log(x, y);
            });

            $.each(dataPerDate, function(x, y) {

                htmlForSleep = htmlForSleep + '<tr><td><h3>' + x + '</h3></td><td>';

                $.each(y, function(x, y) {

                    begin = new Date(y.begin);
                    end = new Date(y.end);

                    htmlForSleep = htmlForSleep + '' + begin.getHours() + ':' + begin.getMinutes() + ' - ' + end.getHours() + ':' + end.getMinutes() + ' ' + ("" + y.len / 1000 + "").toHHMMSS() + '<br>';
                });

                htmlForSleep = htmlForSleep + '</td></tr>';
            });

            console.log("dates", dataPerDate);

            $(".sleep").html(htmlForSleep + "</table>");

        });
    }
    var socket = io.connect('http://' + window.location.hostname);

    socket.on('connect', function() {
        $(".connection").html('<i class="glyphicon glyphicon-ok" style="color:' + green + ';"></i>');

        if (localStorage.me === undefined || localStorage.me === "") {

            var name = prompt("Geef mij een naam");
            localStorage.me = name;
            socket.emit("me", name);


        } else {
            socket.emit("me", localStorage.me);
        }

        $("#login_form").submit(function(e) {
            e.preventDefault();

            $.ajax({
                url: "/authenticate",
                data: {
                    user: $("#login #email").val(),
                    pass: $("#login #pass").val(),
                    sock: socket.socket.sessionid
                },
                type: "POST",
                success: function(data) {
                    console.log("loginrespons", data);
                }
            });
        });

    });

    socket.on('loggedout', function(reason) {
        console.log("LOGGED OUT: ", reason);
        $("#dashboard, .navbar").hide();
        $("#login").show();
    });

    socket.on('loggedin', function() {
        $("#dashboard, .navbar").show();
        $("#login").hide();
        var timeOut = "a";
        socket.on('sleepStatus', function(data) {
            if (timeOut != "a") {
                clearInterval(timeOut);
            }
            if (data.status === 2) {

                $("#sleepStatus").fadeIn().css({
                    background: green
                });
                timeOut = setInterval(function() {

                    var time = new Date().getTime();

                    $("#sleepStatus").find(".time").html(("" + (time - data.bedTime) / 1000 + "").toHHMMSS());

                }, 1000);
            } else if (data.status === 1) {

                $("#sleepStatus").fadeIn().css({
                    background: orange
                });
                var time = new Date().getTime();
                $("#sleepStatus").find(".time").html(("" + (time - data.bedTime) / 1000 + "").toHHMMSS());

                if (timeOut != "a") {
                    clearInterval(timeOut);
                }



            } else {
                $("#sleepStatus").fadeOut();
            }


        });
        socket.on('refreshE', function(data) {
            console.log('refreshE', data);
            if (data.event === "restart") {
                setTimeout(function() {
                    window.location.reload();
                }, 20000);
            }
        })
        socket.on('connecting', function() {

            $(".connection").html('<i class="glyphicon glyphicon-minus"></i>');
            $(".ssh").html('');
        });

        socket.on('connect_failed', function() {

            $(".connection").html('<i class="glyphicon glyphicon-remove" style="color:' + red + ';"></i>');
            $(".ssh").html('');
        });

        socket.on('disconnect', function() {

            $(".connection").html('<i class="glyphicon glyphicon-remove" style="color:' + red + ';"></i>');
            $(".ssh").html('');
        });


        socket.on('switches', function(data) {
            var html = "<div class=\"row\">";
            var configHtml = "";
            $.each(data, function(x, y) {
                var color = red;
                if (y.state === 1) {
                    color = green;
                }

                var needsConfirm = "false";

                if (y.needsConfirm !== undefined)
                    if (y.needsConfirm)
                        needsConfirm = "true";

                html += '<div class="col-md-3"><a class="switch well" id="switch-' + y.id + '" style="background:' + color + '" data-needsconfim="' + needsConfirm + '"><h3><span class="' + y.icon + '"></span> ' + y.name + '</h3></a></div>';
                configHtml += '<div class="well">'
                configHtml += '<input type="text" id="configsFrom-' + y.id + '-name" value="' + y.name + '">'
                configHtml += brandOption(y.id, y.brand);
                configHtml += '<input type="text" id="configsFrom-' + y.id + '-code" value="' + y.code + '">'
                configHtml += '<input type="text" id="configsFrom-' + y.id + '-switch" value="' + y.
                switch +'">'
                configHtml += '</div>';
            });

            $(".switches").html(html + "</div>");
            $(".configs").html(configHtml + "");
            $(".switch").each(function() {
                var self = this;
                $(this).click(function(e) {
                    e.preventDefault();
                    $(this).css({
                        "background": orange
                    });

                    var confimation = true;

                    if ($(self).attr("data-needsconfim") === "true")
                        confimation = confirm("Weet je zeker dat je deze knop wilt omswitchen?");

                    if (confimation)
                        socket.emit("switch", {
                            id: parseInt($(this).attr("id").replace("switch-", ""))
                        });
                });
            });

            localStorage.setItem("switches", JSON.stringify(data));
        });

        socket.on("clients", function(data) {
            data = JSON.parse(data);
            console.log(data);

            var html = "";
            $.each(data, function(x, y) {
                var color = red;
                if (y.state === true) {
                    color = green;
                }
                if (y.name != "" && y.name != null)
                    html += '<span class="device well" id="device-' + y._id + '" style="background:' + color + '">' + y.name + '</span>';
            });

            $(".clients").html(html);
            localStorage.setItem("clients", JSON.stringify(data));
        });

        socket.on("devices", function(data) {
            console.log(data);

            var html = "";
            $.each(data, function(x, y) {
                var color = red;
                if (y.state === 1) {
                    color = green;
                }

                html += '<span class="device well" id="device-' + y.id + '" style="background:' + color + '"><span class="' + y.icon + '"></span> ' + y.name + '</span>';
            });

            $(".devices").html(html);
            localStorage.setItem("devices", JSON.stringify(data));
        });

        socket.on("deviceChange", function(data) {
            console.log("deviceChange", data);
            var color = red;
            if (data.state === 1) {
                color = green;
            }

            $("#device-" + data._id).css({
                "background": color
            });
        });
        var alarmArm = 0;
        socket.on("alarmArm", function(data) {

            console.log("alarmArm", data);

            var color = red;
            if (data === 1) {
                color = green;
            }

            alarmArm = data;

            $(".alarm").css({
                background: color
            });

        });

        $(".alarm").click(function() {
            if (alarmArm === 1) {
                setA = 0;
            } else {
                setA = 1;
            }
            socket.emit("setAlarm", setA);
        });

        var triggerArm = 0;
        socket.on("triggerArm", function(data) {

            console.log("triggerArm", data);

            var color = red;
            if (data === 1) {
                color = green;
            }

            triggerArm = data;

            $(".trigger").css({
                background: color
            });

        });

        $(".trigger").click(function() {
            if (triggerArm === 1) {
                setT = 0;
            } else {
                setT = 1;
            }
            console.log("Set trigger", setT);
            socket.emit("setTrigger", setT);
        });

        var backgroundOverrule = false;
        socket.on("backgroundOverrule", function(data) {

            console.log("backgroundOverrule", data);

            var color = red;
            if (data === true) {
                color = green;
            }

            backgroundOverrule = data;

            $(".background-override").css({
                background: color
            });

        });

        $(".background-override").click(function() {
            if (backgroundOverrule === true) {
                setT = false;
            } else {
                setT = true;
            }
            console.log("setBackgroundOverrule", setT);
            socket.emit("setBackgroundOverrule", setT);
        });

        socket.on("switched", function(data) {

            console.log("SWITCH", data);

            var color = red;
            if (data.switcher.state === 1) {
                color = green;
            }

            $("#switch-" + data.id).css({
                "background": color
            });

        });
        socket.on("cpu", function(data) {
            if (data < 1) {
                $(".cpu").css({
                    background: green
                });
            }
            if (data >= 1 && data < 3) {
                $(".cpu").css({
                    background: orange
                });
            }
            if (data >= 3) {
                $(".cpu").css({
                    background: red
                });
            }
            $(".cpu").html("CPU: " + (Math.round(data * 100) / 100));
        });
        socket.on("mem", function(data) {

            if (data < 0.5) {
                $(".mem").css({
                    background: green
                });
            }
            if (data >= 0.5 && data < 0.75) {
                $(".mem").css({
                    background: orange
                });
            }
            if (data >= 0.75) {
                $(".mem").css({
                    background: red
                });
            }

            $(".mem").html("Mem: " + (Math.round(data * 100)) + "%");
        });
        socket.on("log", function(data) {
            console.log("LOG", data);

            var log = "";
            var i = 0;

            $.each(data, function(x, y) {
                log = log + '<p class="l">' + jQuery.timeago(new Date(y.time)) + ': ' + y.action + '</p>';
            });

            $(".log").html(log);

        });

        socket.on("logAdd", function(y) {
            console.log("logAdd", y);
            $(".log").prepend('<p class="l">' + jQuery.timeago(new Date(y.time)) + ': ' + y.action + '</p>');
        });
        socket.on("state", function(data) {

            if (data.ssh) {

                $(".ssh").html('<i class="glyphicon glyphicon-ok" style="color:' + green + ';"></i>');

            } else {
                $(".ssh").html('<i class="glyphicon glyphicon-remove" style="color:' + red + ';"></i>');
            }

        });

        socket.on('temp', function(data) {
            console.log("TEMP", data);

            $(".temp").html(data);

        });

        socket.on('lightsLume', function(data) {
            console.log("lightsLume", data);

            $(".lightsLume").html(data);

        });

        $(".refresh").click(function() {
            socket.emit("refresh", true);
        });
        plot();
        setTimeout(function() {
            plot();
        }, 10000);



        ///151561651561651561fadsf

        $('#calendar').fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },

            editable: false,
            defaultView: 'agendaDay',
            eventSources: [
                "/agenda/"
            ],
            timezone: 'local',
            timeFormat: 'H(:mm)',
            eventDrop: function(event, delta) {
                alert(event.title + ' was moved ' + delta + ' days\n' +
                    '(should probably update your database)');
            },

            loading: function(bool) {
                if (bool) $('#loading').show();
                else $('#loading').hide();
            }

        });
    });
    $(window).on("hashchange", function() {

        var hash = location.hash;

        if (hash == "#" || hash == "") {
            hash = "#home";
        }

        console.log("hash", hash);

        $(".page").hide();

        $(hash).show();

    });

    $(window).trigger("hashchange");
});