
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, GraduationCap, Users } from "lucide-react";

type Role = "admin" | "student" | "mentor";

interface RoleSelectorProps {
  selectedRole: Role | null;
  onSelectRole: (role: Role) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  selectedRole,
  onSelectRole,
}) => {
  const roles = [
    {
      id: "admin",
      name: "Admin",
      description: "Access admin dashboard and management tools",
      icon: Shield,
    },
    {
      id: "student",
      name: "Student",
      description: "Access learning resources and student features",
      icon: GraduationCap,
    },
    {
      id: "mentor",
      name: "Mentor",
      description: "Access mentorship tools and student management",
      icon: Users,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {roles.map((role) => {
        const Icon = role.icon;
        const isSelected = selectedRole === role.id;
        
        return (
          <Card
            key={role.id}
            className={`cursor-pointer transition-all ${
              isSelected
                ? "border-primary bg-primary/5 shadow-md"
                : "hover:bg-muted/50"
            }`}
            onClick={() => onSelectRole(role.id as Role)}
          >
            <CardContent className="flex flex-col items-center justify-center gap-2 p-6 text-center">
              <Icon className={`h-10 w-10 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="text-xl font-semibold">{role.name}</h3>
              <p className="text-sm text-muted-foreground">{role.description}</p>
              
              <Button 
                variant={isSelected ? "default" : "outline"} 
                className="mt-2"
                onClick={() => onSelectRole(role.id as Role)}
              >
                {isSelected ? "Selected" : "Select"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RoleSelector;
