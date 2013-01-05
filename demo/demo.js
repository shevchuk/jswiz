window.addEvent('load', function(){
    var addUser = $('addUser');
    var confirmUser = $('confirmUser');
    var congrats = $('congrats');

    var w = new Wiz({
        name: 'wiz',
        onComplete: function() {
            var completedScreen = $('completedScreen');

            completedScreen.setStyle('display', 'block');
            congrats.setStyle('display', 'none');

            var s = w.getStorage();

            $('toolbar').set('html',
                '<p>First name: ' + s.firstName + '</p>' +
                '<p>Second name: ' + s.secondName + '</p>'
            );
            console.log(w.getStorage())
        }
    });

    $('next').onclick = function () {
        updateToolbar();
        w.next();
    }

    $('back').onclick = function () {
        updateToolbar();
        w.back();
    }

    $('complete').onclick = function () {
        updateToolbar();
        w.next();
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