import { Card, CardContent, CardHeader } from "./ui/card";

export function DraftCard() {
    return (
        <Card className="mb-8">
           <CardContent className="p-6">
            <strong>This post is a draft.</strong> You probably got here because Simon sent you a link. Please don't share this link. 
            </CardContent> 
        </Card>
    )
}