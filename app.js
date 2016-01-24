var express = require('express'),
    app = express();

app.use(express.static(__dirname + '/public/'));

var port = process.env.PORT || 8080;

app.set('port', port);

app.listen(app.get('port'), function(){
    console.log('html5 video player library app started on port ' + app.get('port'));
});