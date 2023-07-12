
document.addEventListener ("DOMContentLoaded", function () {
    const exchange = new ccxt.pro.binance ({ enableRateLimit: true })
    let USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    //infinite scrolls
    // $(window).scroll(function () { 
    //     if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
    //        //Add something at the end of the page
    //        console.log('load pls');
    //     }
    //  });

    //ticker puller

    function fetchTick(symbol, ids) {
        exchange.fetchTicker(symbol).then(function(ticker) {
            $("#" + ids).text(USDollar.format(ticker.last));
        });
    }

    const pollTickerContinuously = async function (symbol, ids) {

        while (true) {

            try {

                const ticker = await exchange.watchTicker (symbol)

                document.getElementById (ids).innerHTML = USDollar.format(ticker.close);

            } catch (e) {

                const text = [
                    e.constructor.name,
                    e.message,
                ]

                // document.getElementById ('content').innerHTML = text.join (' ');
                console.log('error', text);

            }
        }
    }

    // const symbol = 'BTC/USDT'

    // pollTickerContinuously (exchange, symbol, "content");

    $("#cResults").hide();

    function adders(iter, maxx){
        console.log('adders calling.. ',iter, maxx);
        while(iter < maxx) {
            var txt = `<div class="col text-center">
                <div class="card h-100 " style="background-color: #1e90ff; color: white;">
                    <div class="card-body">
                        <h3>${gdata[iter]["name"]}</h3>
                        <h5 id="content${iter}"><div class="spinner-border" role="status"></div></h5>
                    </div>
                </div>
            </div>`;
            var symb = gdata[iter]["symbol"], noarr = ["DAI"];
            if(gserves[symb] && gserves[symb]["binance"] && symb != noarr) {
                var serve = gserves[symb]["binance"][0];
                fetchTick( symb + "/" + serve, "content" + iter);
                pollTickerContinuously ( symb + "/" + serve , "content" + iter);
                $("#cardGroup").append(txt);
            }
            iter++;

        };
    }

    var gdata, gserves;
    //fetch symbols
    var iter = 0, maxx = 30;
    $.getJSON("tmp/final.json", function(data) {
        gdata = data;
        $.getJSON("tmp/data.json", function(serves) {
            gserves = serves;
            adders(iter, maxx);
        });
    });

    //

    var countries = [
        { value: 'Andorra', data: 'AD' },
        // ...
        { value: 'Zimbabwe', data: 'ZZ' }
    ];
    

    $.getJSON("tmp/connect.json", function(datat) {
        // datat = JSON.parse(datat);
        // Object.keys(datat).forEach(function(d1) {
        //     autoc.push({
        //         value: datat[d1],
        //         data: d1
        //     });
        // });
        // console.log('auto', autoc);
        // $("#autocomplete").autocomplete({
        //     lookup: countries,
        //     source: countries.map(function(c) {return c.value}),
        //     onSelect: function(sug) {
        //         alert(sug.name);
        //     }
        // })
        var options = {
            url: 'tmp/final.json',
            getValue: "name",

            list: {
                onChooseEvent: function(it, i) {
                    var item = $("#autocomplete").val();
                    console.log(item, datat[item]);
                    $("#cResults").show();
                    $("#cTitle").text(item);
                    $("#cPrice").text("loading..");
                    fetchTick( datat[item] + "/" + gserves[datat[item]]["binance"][0], "cPrice");
                },
                match: {
                    enabled: true
                }
            }
        }
        $("#autocomplete").easyAutocomplete(options);

        $("#autocomplete").on("change", function(e){
            e.preventDefault();

        });
    });

    //modal clos
    $("#searchModal").on("hidden.bs.modal", function () {
        // put your default event here
        $("#cResults").hide();
    });

    //
    $("#loadMore").click(function(e) {
        $(this).attr("disabled", "true");
        e.preventDefault();
//
        iter = maxx; maxx = maxx + 30;
        console.log("now", iter, maxx);
        adders(iter,maxx);
        $(this).removeAttr("disabled");

    })
});
