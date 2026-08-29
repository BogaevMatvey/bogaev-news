/* =========================================================
   🔒 GLOBAL BAN GUARD
   Проверяет BAN / TEMPORARY BAN на всех страницах,
   кроме about.html.
   ========================================================= */

(function () {

    const ALLOWED_PAGE = "about.html";

    function getCurrentPage() {
        const path = window.location.pathname;
        const file = path.split("/").pop();

        return file || "index.html";
    }

    function isAllowedPage() {
        return getCurrentPage().toLowerCase() ===
            ALLOWED_PAGE.toLowerCase();
    }

    async function checkGlobalBan() {

        /*
         * about.html специально оставляем доступным,
         * чтобы заблокированный пользователь мог
         * обратиться в поддержку.
         */
        if (isAllowedPage()) {
            return;
        }

        /*
         * Ждём Supabase client из main.js.
         */
        for (
            let attempt = 0;
            attempt < 100;
            attempt++
        ) {

            if (
                typeof supabaseClient !==
                "undefined"
            ) {
                break;
            }

            await new Promise(
                resolve =>
                    setTimeout(resolve, 100)
            );
        }

        if (
            typeof supabaseClient ===
            "undefined"
        ) {
            console.error(
                "BAN GUARD: supabaseClient не найден."
            );

            return;
        }

        const {
            data: userData,
            error: userError
        } =
            await supabaseClient.auth.getUser();

        if (
            userError ||
            !userData ||
            !userData.user
        ) {
            return;
        }

        const {
            data,
            error
        } =
            await supabaseClient.rpc(
                "get_active_user_punishment",
                {
                    target_user_id:
                        userData.user.id
                }
            );

        if (error) {

            console.error(
                "BAN GUARD:",
                error
            );

            return;
        }

        let punishment = null;

        if (Array.isArray(data)) {

            punishment =
                data.find(
                    item =>
                        item &&
                        (
                            String(
                                item.punishment_type ||
                                ""
                            ).toLowerCase() ===
                            "ban"

                            ||

                            String(
                                item.punishment_type ||
                                ""
                            ).toLowerCase() ===
                            "temporary_ban"
                        )
                ) || null;

        } else if (
            data &&
            (
                String(
                    data.punishment_type ||
                    ""
                ).toLowerCase() ===
                "ban"

                ||

                String(
                    data.punishment_type ||
                    ""
                ).toLowerCase() ===
                "temporary_ban"
            )
        ) {

            punishment = data;
        }

        if (!punishment) {
            return;
        }

        /*
         * Если пользователь уже заблокирован,
         * отправляем его на главную.
         *
         * index.html содержит само окно блокировки.
         */
        if (
            getCurrentPage().toLowerCase() !==
            "index.html"
        ) {

            window.location.replace(
                "index.html"
            );

            return;
        }
    }

    /*
     * Запускаем проверку.
     */
    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            checkGlobalBan
        );

    } else {

        checkGlobalBan();

    }

})();