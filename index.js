(() => {
    'use strict';

    const settings = {
        hasAddition: true,
        hasSubtraction: true,
        hasMultiplication: false,
        hasDivision: false,
        numberOfCards: 4,
        maxNumber: 20
    };
    const cardImgs = [
        './24-card-1.svg',
        './24-card-2.svg',
        './24-card-3.svg'
    ];
    const random = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    const pickRandom = (arr) => arr[random(0, arr.length - 1)];
    const remove = (arr, number) => {
        if (arr.includes(number)) {
            arr.splice(arr.indexOf(number), 1);
        }
    };
    const isValid = ($el, valid, msg) => {
        if (!$el) return $el;
        if (Array.isArray($el)) return $el.map(el => isValid(el, valid, msg));

        if (valid) {
            $el.classList.remove('is-invalid');
        } else {
            $el.classList.add('is-invalid');
            if (msg) {
                const $feedback = $el.parentElement.querySelector('.invalid-feedback');
                if ($feedback) {
                    $feedback.innerText = msg;
                }
            }
        }
        return $el;
    };
    const $printBtn = document.getElementById('print-btn');
    $printBtn.addEventListener('click', () => {
        var $gameCard = document.querySelector('.game-card');

        if ($gameCard) window.print();
        else alert('No Game Cards to Print!!!');
    });
    const $hasAdditionChk = document.getElementById('has-addition-chk');
    $hasAdditionChk.addEventListener('change', () => {
        settings.hasAddition = $hasAdditionChk.checked;
        if (!settings.hasAddition) {
            $hasSubtractionChk.checked = settings.hasSubtraction = false;
        }
        validateOperators();
    });
    const $hasSubtractionChk = document.getElementById('has-subtraction-chk');
    $hasSubtractionChk.addEventListener('change', () => {
        settings.hasSubtraction = $hasSubtractionChk.checked;
        if (settings.hasSubtraction) {
            $hasAdditionChk.checked = settings.hasAddition = true;
        }
        validateOperators();
    });
    const $hasMultiplicationChk = document.getElementById('has-multiplication-chk');
    $hasMultiplicationChk.addEventListener('change', () => {
        settings.hasMultiplication = $hasMultiplicationChk.checked;
        if (!settings.hasMultiplication) {
            $hasDivisionChk.checked = settings.hasDivision = false;
        }
        validateOperators();
    });
    const $hasDivisionChk = document.getElementById('has-division-chk');
    $hasDivisionChk.addEventListener('change', () => {
        settings.hasDivision = $hasDivisionChk.checked;
        if (settings.hasDivision) {
            $hasMultiplicationChk.checked = settings.hasMultiplication = true;
        }
        validateOperators();
    });
    const validateOperators = () => {
        isValid([$hasAdditionChk, $hasSubtractionChk, $hasMultiplicationChk, $hasDivisionChk], true);
        isValid($hasAdditionChk.parentElement.parentElement, true);
        if (!settings.hasAddition &&
            !settings.hasSubtraction &&
            !settings.hasMultiplication &&
            !settings.hasDivision) {
            isValid([$hasAdditionChk, $hasSubtractionChk, $hasMultiplicationChk, $hasDivisionChk], false);
            isValid($hasAdditionChk.parentElement.parentElement, false, 'Must pick at least one operation.');
        }
    };
    const $numberOfCards = document.getElementById('number-of-cards');
    $numberOfCards.addEventListener('change', () => {
        isValid($numberOfCards, true);
        const val = +$numberOfCards.value;
        if (isNaN(val)) return isValid($numberOfCards, false, 'Invalid value.');
        if (val < 1) return isValid($numberOfCards, false, 'Number must be greater than 0.');
        if (val > 40) return isValid($numberOfCards, false, 'Number must be less than 40.');
        settings.numberOfCards = val;
    });
    const $maxNumber = document.getElementById('max-number');
    $maxNumber.addEventListener('change', () => {
        isValid($maxNumber, true);
        const val = +$maxNumber.value;
        if (isNaN(val)) return isValid($maxNumber, false, 'Invalid value.');
        if (val < 10) return isValid($maxNumber, false, 'Number must be greater than or equal to 20.');
        if (val > 99) return isValid($maxNumber, false, 'Number must be less than 100.');
        settings.maxNumber = val;
    });
    const $playBtn = document.getElementById('play-btn');
    $playBtn.addEventListener('click', () => {
        const $invalid = document.querySelector('.is-invalid');

        if ($invalid) return $invalid.focus();
        console.log(settings);

        const operators = [];
        if (settings.hasAddition) operators.push('+');
        if (settings.hasSubtraction) operators.push('-');
        if (settings.hasMultiplication) operators.push('*');
        if (settings.hasDivision) operators.push('/');
        $gameCards.replaceChildren();
        let $row;
        for (let i = 0; i < settings.numberOfCards; i++) {
            if (i % 2 === 0) {
                $row = document.createElement('div');
                $row.classList.add('row');
                $gameCards.append($row);
            }

            const numbers = [24];
            const solution = [];
            while (numbers.length < 4) {
                const operand = pickRandom(numbers);
                let operator = pickRandom(operators);

                let number;
                let randomNumber = random(1, settings.maxNumber);

                // Prevent exceeding max number
                if (operator === '-' && operand > settings.maxNumber) {
                    operator = '+';
                } else if (operator === '/' && operand > settings.maxNumber) {
                    operator = '*';
                }

                switch (operator) {
                    case '-':
                        number = operand + randomNumber;
                        break;
                    case '*':
                        number = Math.floor(operand / randomNumber);
                        randomNumber = operand / number;
                        if (`${randomNumber}`.indexOf('.') !== -1) continue;
                        break;
                    case '/':
                        number = operand * randomNumber;
                        break;
                    default:
                        number = operand - randomNumber;
                        break;
                }

                // TODO: Allow negative if opt-in
                if (number < 1) {
                    continue;
                }
                if (number > settings.maxNumber) {
                    // Exceeded max number
                    continue;
                }

                remove(numbers, operand);
                numbers.push(number);
                numbers.push(randomNumber);
                solution.unshift(`${number} ${operator} ${randomNumber} = ${operand}`);
            }
            console.log(numbers, solution);
            const $clone = $gameCardTmpl.content.cloneNode(true);
            for (let j = 0; j < 4; j++) {
                const $number = $clone.querySelector(`.card-number-${j + 1}`);
                if (numbers[j] > 9) $number.classList.add('double-digit');
                else $number.classList.add('single-digit');

                if (`${numbers[j]}`.indexOf('9') !== -1) {
                    $number.classList.add('nine-digit');
                }

                $number.innerText = numbers[j];
            }
            const largestNumber = Math.max(...numbers);
            const difficulty = largestNumber < (settings.maxNumber * 2 / 3) ? 0 :
                largestNumber < (settings.maxNumber * 3 / 4) ? 1 :
                2;

            $clone.querySelector('img').src = cardImgs[difficulty];
            $row.append($clone);
        }
    });
    const $gameCards = document.querySelector('.game-cards');
    const $gameCardTmpl = document.getElementById('game-card-tmpl');

    $playBtn.dispatchEvent(new Event('click'));
    /*!
     * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
     * Copyright 2011-2023 The Bootstrap Authors
     * Licensed under the Creative Commons Attribution 3.0 Unported License.
     */

    (() => {
        'use strict';

        const getStoredTheme = () => localStorage.getItem('theme');
        const setStoredTheme = theme => localStorage.setItem('theme', theme);

        const getPreferredTheme = () => {
            const storedTheme = getStoredTheme();
            if (storedTheme) {
                return storedTheme
            }

            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        };

        const setTheme = theme => {
            if (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.setAttribute('data-bs-theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-bs-theme', theme);
            }
        };

        setTheme(getPreferredTheme());

        const showActiveTheme = (theme, focus = false) => {
            const themeSwitcher = document.querySelector('#bd-theme');

            if (!themeSwitcher) {
                return;
            }

            const themeSwitcherText = document.querySelector('#bd-theme-text');
            const activeThemeIcon = document.querySelector('.theme-icon-active use');
            const btnToActive = document.querySelector(`[data-bs-theme-value="${theme}"]`);
            const svgOfActiveBtn = btnToActive.querySelector('svg use').getAttribute('href');

            document.querySelectorAll('[data-bs-theme-value]').forEach(element => {
                element.classList.remove('active');
                element.setAttribute('aria-pressed', 'false');
            })

            btnToActive.classList.add('active');
            btnToActive.setAttribute('aria-pressed', 'true');
            activeThemeIcon.setAttribute('href', svgOfActiveBtn);
            const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`;
            themeSwitcher.setAttribute('aria-label', themeSwitcherLabel);

            if (focus) {
                themeSwitcher.focus();
            }
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            const storedTheme = getStoredTheme();
            if (storedTheme !== 'light' && storedTheme !== 'dark') {
                setTheme(getPreferredTheme());
            }
        });

        window.addEventListener('DOMContentLoaded', () => {
            showActiveTheme(getPreferredTheme());

            document.querySelectorAll('[data-bs-theme-value]')
                .forEach(toggle => {
                    toggle.addEventListener('click', () => {
                        const theme = toggle.getAttribute('data-bs-theme-value');
                        setStoredTheme(theme);
                        setTheme(theme);
                        showActiveTheme(theme, true);
                    })
                });
        });
    })();
})();