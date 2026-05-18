-- CreateEnum
CREATE TYPE "Role" AS ENUM ('superadmin', 'usuario');

-- CreateEnum
CREATE TYPE "CameraStatus" AS ENUM ('activa', 'inactiva', 'error');

-- CreateEnum
CREATE TYPE "EventPriority" AS ENUM ('baja', 'media', 'alta', 'critica');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('pendiente', 'revisado', 'resuelto');

-- CreateEnum
CREATE TYPE "AlertPriority" AS ENUM ('baja', 'media', 'alta', 'critica');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "lastname" VARCHAR(100) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'usuario',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cameras" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "ip" VARCHAR(45) NOT NULL,
    "streamUrl" VARCHAR(500),
    "status" "CameraStatus" NOT NULL DEFAULT 'inactiva',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cameras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "cameraId" UUID NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "location" VARCHAR(255),
    "imageUrl" VARCHAR(500),
    "confidence" DOUBLE PRECISION,
    "aiMetadata" JSONB,
    "priority" "EventPriority" NOT NULL DEFAULT 'media',
    "status" "EventStatus" NOT NULL DEFAULT 'pendiente',
    "reviewedBy" UUID,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "priority" "AlertPriority" NOT NULL DEFAULT 'media',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "cameras_status_idx" ON "cameras"("status");

-- CreateIndex
CREATE INDEX "cameras_location_idx" ON "cameras"("location");

-- CreateIndex
CREATE INDEX "events_cameraId_idx" ON "events"("cameraId");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_priority_idx" ON "events"("priority");

-- CreateIndex
CREATE INDEX "events_createdAt_idx" ON "events"("createdAt");

-- CreateIndex
CREATE INDEX "events_reviewedBy_idx" ON "events"("reviewedBy");

-- CreateIndex
CREATE INDEX "alerts_eventId_idx" ON "alerts"("eventId");

-- CreateIndex
CREATE INDEX "alerts_priority_idx" ON "alerts"("priority");

-- CreateIndex
CREATE INDEX "alerts_createdAt_idx" ON "alerts"("createdAt");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_cameraId_fkey" FOREIGN KEY ("cameraId") REFERENCES "cameras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
