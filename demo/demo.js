window.addEvent('load', function(){

    var addUser = $('addUser');
    var confirmUser = $('confirmUser');
    var congrats = $('congrats');

    var w = new Wiz({
        name: 'wiz'
    });

    $('next').onclick = function () {
        w.next();
        updateToolbar();
    }

    $('back').onclick = function () {

        w.back();
        updateToolbar();
    }

    $('complete').onclick = function () {
        w.next();
        updateToolbar();
        console.log(w.getStorage());
    }

    hideAll();

    function updateToolbar() {
        var moves = w.getAvailableMoves();

        $('next').setStyle('display', moves.next?'block':'none');
        $('back').setStyle('display', moves.back?'block':'none');
        $('complete').setStyle('display', moves.final?'block':'none');
    };

    function hideAll() {
        addUser.setStyle('display', 'none');
        confirmUser.setStyle('display', 'none');
        congrats.setStyle('display', 'none');
    };

    var addUserStep = new WizStep({
        name: 'addUserStep',
        getValues: function() {
            return {
                firstName: $('firstName').value,
                secondName: $('secondName').value
            };
        },
        onEnter: function(p) {
            hideAll();
            addUser.setStyle('display', 'block');
        },
        getNextStep: function() {
            return 'confirmUser';
        }
    });

    var confirmUserStep = new WizStep({
        name: 'confirmUser',
        getValues: function() {
            return {
                confirm: $('confirm').checked
            };
        },
        onEnter: function(p) {
            hideAll();
            updateToolbar();

            confirmUser.setStyle('display', 'block');
        },
        getNextStep: function() {
            return 'congrats';
        }
    });

    var congratsStep = new WizStep({
        name: 'congrats',
        getValues: function() {
            return {
                addAnother: $('addAnother').checked
            };
        },
        onEnter: function(p) {
            hideAll();
            updateToolbar();
            congrats.setStyle('display', 'block');
        },
        final: true
    });

    w.addStep(addUserStep);
    w.addStep(confirmUserStep);
    w.addStep(congratsStep);

    w.start();

    updateToolbar();
});