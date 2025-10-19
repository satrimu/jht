<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SecurityLogger
{
    /**
     * Log a failed login attempt
     */
    public function logFailedLogin(string $email, Request $request): void
    {
        Log::channel('security')->warning('Failed login attempt', [
            'email' => $email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Log a successful login
     */
    public function logSuccessfulLogin($user, Request $request): void
    {
        Log::channel('security')->info('Successful login', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Log account lockout due to too many failed attempts
     */
    public function logAccountLockout(string $email, Request $request): void
    {
        Log::channel('security')->alert('Account locked due to too many failed attempts', [
            'email' => $email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Log unauthorized access attempt
     */
    public function logUnauthorizedAccess($user, string $action, Request $request): void
    {
        Log::channel('security')->warning('Unauthorized access attempt', [
            'user_id' => $user?->id,
            'email' => $user?->email,
            'action' => $action,
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Log privilege escalation attempt
     */
    public function logPrivilegeEscalation($user, string $attemptedRole, Request $request): void
    {
        Log::channel('security')->critical('Privilege escalation attempt detected', [
            'user_id' => $user->id,
            'current_role' => $user->role,
            'attempted_role' => $attemptedRole,
            'ip' => $request->ip(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Log sensitive data access
     */
    public function logSensitiveDataAccess($user, string $dataType, $recordId): void
    {
        Log::channel('security')->info('Sensitive data accessed', [
            'user_id' => $user->id,
            'data_type' => $dataType,
            'record_id' => $recordId,
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Log a successful logout
     */
    public function logSuccessfulLogout($user, Request $request): void
    {
        Log::channel('security')->info('Successful logout', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Log password reset request
     */
    public function logPasswordResetRequested(string $email, Request $request): void
    {
        Log::channel('security')->info('Password reset requested', [
            'email' => $email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Log successful password reset
     */
    public function logPasswordResetSuccess($user, Request $request): void
    {
        Log::channel('security')->info('Password reset successful', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
