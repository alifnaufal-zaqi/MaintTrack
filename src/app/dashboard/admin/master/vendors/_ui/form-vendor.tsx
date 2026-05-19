"use client";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";

import Link from "next/link";

export function FormVendor() {
  return (
    <Card className="w-full">

      {/* HEADER */}
      <CardHeader>

        <CardTitle>
          Form Pembuatan Vendor
        </CardTitle>

        <CardDescription>
          Tambahkan data vendor asset disini
        </CardDescription>

      </CardHeader>

      {/* FORM */}
      <form action="">

        <CardContent>

          <FieldSet>

            <FieldGroup>

              {/* LOGO */}
              <Field>

                <FieldLabel htmlFor="logo">
                  Logo Vendor
                </FieldLabel>

                <Input
                  type="file"
                  id="logo"
                  name="logo"
                />

              </Field>

              {/* NAME */}
              <Field>

                <FieldLabel htmlFor="name">
                  Nama Vendor
                </FieldLabel>

                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Masukan nama vendor"
                />

              </Field>

              {/* EMAIL */}
              <Field>

                <FieldLabel htmlFor="email">
                  Email Vendor
                </FieldLabel>

                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Masukan email vendor"
                />

              </Field>

              {/* CONTACT */}
              <Field>

                <FieldLabel htmlFor="contact">
                  Kontak Vendor
                </FieldLabel>

                <Input
                  type="text"
                  id="contact"
                  name="contact"
                  placeholder="Masukan nomor kontak vendor"
                />

              </Field>

              {/* ADDRESS */}
              <Field>

                <FieldLabel htmlFor="address">
                  Alamat Vendor
                </FieldLabel>

                <Input
                  type="text"
                  id="address"
                  name="address"
                  placeholder="Masukan alamat vendor"
                />

              </Field>

            </FieldGroup>

          </FieldSet>

        </CardContent>

        {/* FOOTER */}
        <CardFooter className="flex gap-2 justify-end mt-4">

          <Link href={"/dashboard/admin/master/vendors"}>

            <Button
              type="button"
              variant={"outline"}
              className="text-primary"
            >
              Kembali
            </Button>

          </Link>

          <Button type="submit">
            Simpan
          </Button>

        </CardFooter>

      </form>

    </Card>
  );
}