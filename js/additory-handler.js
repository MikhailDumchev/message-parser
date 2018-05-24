function AdditoryHandler() {
    "use strict";
    var productID = 0;
    this.ProductID = function(value) {
        if (!arguments.length) return productID;
        else productID = value;
    };
    //Идентификатор интервала, который отвечает за обратный отсчёт;
    var timerID = 0;
    //Задержка перед возможностью отправки следующего сообщения;
    var delay = 5000;
    var timerDelay = 10000;
    var commentsLimit = 20;
    var handlerAddress = "https://air2.yaroslav-samoylov.com/lead/zoho/";
    var nounDeclension = ["секунду", "секунды", "секунд"];
    var timerOutputClassName = "timer";
    var plugClassName = "plug";
    var textFieldContainerClassName = "hc__form";
    var commentsContainerClassName = "hc__messages";
    var textContainerClassName = "hc__message__comment";
    var commentClassName = "hc__message";
    var notificationClassName = "notification";
    var application = new Object();
    var textFieldContainer = new Object();
    var commentsContainer = new Object();
    var commentNumber = 0;
    var template = new Object();
    this.Template = function(value) {
        if (!arguments.length) return template;
        else template = value;
    };
    var templateData = {
        "src": "http://static.hypercomments.com/data/avatars/9496804/avatar",
        "name": "Cлужба Поддержки Ярослава Самойлова",
        "message": "Благодарим за обращение, ассистент свяжется с Вами))"
    };
    var plug = new Object();
    this.Application = function(value) {
        if (!arguments.length) return application;
        else application = value;
    };
    this.initialize = function() {
        var additoryVariable = selectElementByClassName(textFieldContainerClassName);
        if (additoryVariable.status) {
            textFieldContainer = additoryVariable.element.parentNode;
            appendHandler();
        } else notify(textFieldContainerClassName, 2);
        additoryVariable = selectElementByClassName(commentsContainerClassName);
        if (additoryVariable.status) {
            commentsContainer = additoryVariable.element;
            appendTimeHandler();
        } else notify(commentsContainerClassName, 2);
    };
    var defineNounDeclension = function(number, titles) {
        var cases = [2, 0, 1, 1, 1, 2];  
        return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];  
    };
    var appendTimeHandler = function() {
        "use strict";
        var additoryVariable = new Object();
        var counter = 0;
        window.setInterval(function() {
            additoryVariable = commentsContainer.getElementsByClassName(commentClassName);
            if (additoryVariable.length > commentsLimit) {
                for (counter = commentsLimit; counter < additoryVariable.length; counter++) {
                    if (additoryVariable[counter] && additoryVariable[counter].parentNode === commentsContainer) {
                        commentsContainer.removeChild(additoryVariable[counter]);
                        counter--;
                    }
                }
                console.log("Отработала очистка");
            }
        }.bind(this), timerDelay);
    };
    var appendPlug = function() {
        var textNode = document.createElement("p");
        textNode.innerHTML = "Можно отправить через: <span class='timer'>" + delay / 1000 + " " + defineNounDeclension(delay / 1000, nounDeclension) + "</span>";
        plug = document.createElement("div");
        plug.className = plugClassName;
        plug.appendChild(textNode);
        textFieldContainer.appendChild(plug);
    };
    var deletePlug = function() {
        textFieldContainer.removeChild(plug);
    };
    var timer = function() {
        var currentTime = delay;
        var additoryVariable = selectElementByClassName(timerOutputClassName, plug);
        if (additoryVariable.status) {
            timerID = window.setInterval(function () {
                currentTime = currentTime - 1000;
                if (currentTime > 0) additoryVariable.element.textContent = currentTime / 1000 + " " + defineNounDeclension(currentTime / 1000, nounDeclension);
                else {
                    window.clearInterval(timerID);
                    deletePlug();
                }
            }.bind(this), 1000);
        }
    };
    var appendNotification = function(container, className) {
        var notification = document.createElement("div");
        if (className) notification.className = className;
        else notification.className = notificationClassName;
        var textNode = document.createElement("p");
        textNode.innerHTML = "Ваша заявка принята!<br/> Наш ассистент свяжется с Вами.";
        var button = document.createElement("span");
        notification.appendChild(textNode);
        notification.appendChild(button);
        container.appendChild(notification);
        button.addEventListener("click", this, true);
    }.bind(this);
    var deleteNotification = function(button) {
        var additoryVariable = searchContainer(button, "class", notificationClassName);
        if (additoryVariable.status) {
            button.removeEventListener("click", this, true);
            additoryVariable.element.parentNode.removeChild(additoryVariable.element);
        }
    }.bind(this);
    var showMessages = function(id) {
        var prefix = "hcm-";
        var comment = document.getElementById(prefix + id);
        var additoryVariable = new Object();
        if (comment) {
            additoryVariable = selectElementByClassName(textContainerClassName, comment);
            if (additoryVariable.status) {
                appendNotification(additoryVariable.element);
            }
        }
        appendNotification(textFieldContainer, "main-notification");
    };
    var appendHandler = function() {
        application.on("streamMessage", function(packet) {
            var data = new Object();
            var phoneNumbers = new Array();
            //Если сообщение отправил пользователь;
            if (packet.is_resp) {
                appendPlug();
                timer();
                if (packet.text.length) {
                    console.log(packet);
                    phoneNumbers = parseMessage(packet.text);
                    console.log(phoneNumbers);
                    if (phoneNumbers.length) {
                        data.initialMessage = packet.text;
                        data.initialName = packet.nick;
                        //Добавление сообщения о принятии заказа;
                        appendReply(data);
                        data = new Object();
                        data.id = packet.id;
                        data.email = packet.email;
                        data.name = packet.nick;
                        data.phoneNumbers = phoneNumbers;
                        sendRequest(data);
                    }
                }
            } else {
                console.log(packet.text.length + "ss");
                if (parseMessage(packet.text) && packet.text.length > 5) {
                    data.initialMessage = packet.text;
                    data.initialName = packet.nick;
                    //Добавление сообщения о принятии заказа;
                    appendReply(data);
                }
            }
        });            
    };
    var getTemplate = function(data) {
        "use strict";
        return template.getTemplate(data);
    };
    var appendReply = function(data) {
        templateData.id = commentNumber;
        templateData.time = Date.now();
        templateData.initialName = data.initialName;
        templateData.initialMessage = data.initialMessage;
        commentsContainer.insertAdjacentHTML("afterbegin", getTemplate(templateData));
        animateHeightIncrease();
        commentNumber++;
    };
    /*
     * Анимация при добавлении авто-комментария;
     */
    var animateHeightIncrease = function() {
        "use strict";
        var comment = document.getElementById("hcm-" + commentNumber);
        var height = parseFloat(window.getComputedStyle(comment, "").height);
        comment.style.cssText = "height: 0px; transition: height 0.2s !important; -webkit-transition: height 0.2s !important; overflow: hidden; opacity: 0;";
        window.setTimeout(function() {
            comment.style.opacity = 1;
            comment.style.height = height + "px";
            comment.addEventListener("transitionend", handleEvent, false);
            comment.addEventListener("webkitTransitionEnd", handleEvent, false);
            comment.addEventListener("otransitionend", handleEvent, false);
        }.bind(this), 1000);
    };
    /*
     * Метод отвечает за проверку текущего символа на его соответсвие цифре;
     */
    var checkForNumber = function(currentSymbol) {
        var number = 0;
        var indicator = false;
        for (var number; number < 10; number++) {
            if (parseInt(currentSymbol) === number) {
                indicator = true;
            }
        }
        return indicator;
    };
    var checkForInitialSymbols = function(currentSymbol) {
        var counter = 0;
        var indicator = false;
        var initialSymbols = ["+", "(", "±"];
        while (!indicator && counter < initialSymbols.length) {
            if (currentSymbol === initialSymbols[counter]) indicator = true;
            else counter++;
        }
        if (!indicator) counter = -1;
        return {"status": indicator, "type": counter};
    };
    /*
     * Метод отвечает за проверку текущего символа на его соответсвие допустимым символам;
     */
    var checkForSymbol = function(currentSymbol, action) {
        var additoryVariable = new Object();
        var symbols = ["(", ")", "-", " "];
        var counter = 0;
        var indicator = false;
        if (action) {
            additoryVariable = checkForInitialSymbols(currentSymbol);
            indicator = additoryVariable.status;
        } else {
            for (counter = 0; counter < symbols.length; counter++) {
                if (currentSymbol === symbols[counter]) {
                    indicator = true;
                }
            }
        }
        return indicator;
    };
    /*
     * Метод отвечает за поиск "точки входа" - символы "+" и "(", а также цифры;
     */
    var findAccessPoint = function(currentSymbol) {
        var indicator = false;
        //"Точкой входа" могут быть символы "+" и "(", а также цифры;
        if (checkForSymbol(currentSymbol, true) || checkForNumber(currentSymbol)) indicator = true;
        return indicator;
    };
    var deleteInitialSymbol = function(result) {
        var additoryVariable = checkForInitialSymbols(result.phoneNumber[0]);
        if (additoryVariable.status) {
            result.phoneNumber = result.phoneNumber.substring(1, result.phoneNumber.length);
        }
    };
    var check = function(message, counter, result, results) {
        if (counter < message.length) {
            if (findAccessPoint(message[counter])) {
                result.phoneNumber = message[counter];
                checkPhoneNumber(message, counter + 1, result);
                if (checkLength(result, true)) {
                    deleteInitialSymbol(result);
                    results.push(result.phoneNumber.trim());
                }
                counter = result.counter;
                check(message, counter, result, results);
            } else {
                counter++;
                check(message, counter, result, results);
            }
        }
    };
    var checkLength = function(result, action) {
        var additoryVariable = checkForInitialSymbols(result.phoneNumber[0]);
        var indicator = true;
        var minimumAmount = 0;
        var maximumAmount = 0;
        switch(additoryVariable.type) {
            case 0:
            case 2:
                minimumAmount = 12;
                maximumAmount = 13;
                break;
            case 1:
                minimumAmount = 11;
                maximumAmount = 11;
                break;
            default:
                minimumAmount = 10;
                maximumAmount = 11;
                break;
        }
        if (!action && result.phoneNumber.length > maximumAmount) indicator = false;
        if (action && result.phoneNumber.length < minimumAmount) indicator = false;
        return indicator;
    };
    var checkPhoneNumber = function(message, counter, result) {
        if ((checkForSymbol(message[counter]) || checkForNumber(message[counter])) && checkLength(result)) {
            //Записываются только цифры;
            if (checkForNumber(message[counter])) result.phoneNumber += message[counter];
            checkPhoneNumber(message, counter + 1, result);
        } else {
            result.status = true;
            result.counter = counter;
            return result;
        }
    };
    var parseMessage = function(message) {
        var counter = 0;
        var results = new Array();
        var result = {status: false, counter: 0, phoneNumber: ""};
        check(message, counter, result, results);
        return results;
    };
    var sendRequest = function(data) {
        var XHR = new XMLHttpRequest();
        var body = "id=" + encodeURIComponent(productID) + "&name=" + encodeURIComponent(data.name) + "&email=" + encodeURIComponent(data.email) + "&phone=" + encodeURIComponent(data.phoneNumbers[0]);
        XHR.open("POST", handlerAddress, true);
        XHR.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        XHR.send(body);
        XHR.onreadystatechange = function() {
            if (XHR.readyState === 4) {
                if (XHR.status === 200) {
                    showMessages(data.id);
                } else notify("К сожалению, при обработке запроса произошла ошибка;");
            }
        };
    };
    this.handleEvent = function(event) {   
        event = window.event || event;
        var target = event.target;
        if (event.type === "click") {
            deleteNotification(target);
        }
    };
}