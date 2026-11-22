import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-muted text-sidebar-primary-foreground dark:bg-white">
                <AppLogoIcon className="size-5 fill-current" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-lg">
                <h2 className="tracking-wider">
                    <span className="mb-0.5 truncate leading-tight font-black">
                        Aisak
                    </span>
                    <span className="font-semibold text-primary">
                        Licensing
                    </span>
                </h2>
            </div>
        </>
    );
}
