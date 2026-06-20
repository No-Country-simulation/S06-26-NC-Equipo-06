import { describe, it, expect } from "vitest";
import { getSubdomain } from "./proxy";

describe("getSubdomain utility", () => {
    it("returns null for localhost without subdomain", () => {
        expect(getSubdomain("localhost")).toBeNull();
        expect(getSubdomain("localhost:3000")).toBeNull();
    });

    it("returns subdomain for localhost with subdomain", () => {
        expect(getSubdomain("lima.localhost")).toBe("lima");
        expect(getSubdomain("lima.localhost:3000")).toBe("lima");
    });

    it("returns null for Vercel main domain", () => {
        expect(getSubdomain("s06-26-nc-equipo-06.vercel.app")).toBeNull();
    });

    it("returns subdomain for Vercel deployment with subdomain", () => {
        expect(getSubdomain("lima.s06-26-nc-equipo-06.vercel.app")).toBe("lima");
    });

    it("returns null for standard main domains", () => {
        const originalEnv = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
        process.env.NEXT_PUBLIC_ROOT_DOMAIN = "saas.com";
        try {
            expect(getSubdomain("saas.com")).toBeNull();
            expect(getSubdomain("www.saas.com")).toBeNull();
        } finally {
            process.env.NEXT_PUBLIC_ROOT_DOMAIN = originalEnv;
        }
    });

    it("returns subdomain for standard domains with subdomain", () => {
        const originalEnv = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
        process.env.NEXT_PUBLIC_ROOT_DOMAIN = "saas.com";
        try {
            expect(getSubdomain("lima.saas.com")).toBe("lima");
            expect(getSubdomain("lima.www.saas.com")).toBe("lima");
        } finally {
            process.env.NEXT_PUBLIC_ROOT_DOMAIN = originalEnv;
        }
    });


    it("works when NEXT_PUBLIC_ROOT_DOMAIN is set to a custom domain", () => {
        const originalEnv = process.env.NEXT_PUBLIC_ROOT_DOMAIN;
        process.env.NEXT_PUBLIC_ROOT_DOMAIN = "lictia.com";
        try {
            expect(getSubdomain("lictia.com")).toBeNull();
            expect(getSubdomain("www.lictia.com")).toBeNull();
            expect(getSubdomain("lima.lictia.com")).toBe("lima");
        } finally {
            process.env.NEXT_PUBLIC_ROOT_DOMAIN = originalEnv;
        }
    });
});

