import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';
import Site from '@/layouts/site-layout';

export default function AuthLayout({ children, title, description, ...props }: { children: React.ReactNode; title: string; description: string }) {
    return (
        <Site>
            <AuthLayoutTemplate title={title} description={description} {...props}>
                {children}
            </AuthLayoutTemplate>
        </Site>
    );
}
